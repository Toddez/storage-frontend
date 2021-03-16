import Auth from '../models/auth';
import { apiUrl } from '../models/config';

function hslToHex(h: number, s: number, l: number) : string {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = (n: number) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}

class Storage {
    static running = false;
    static fetchListeners = [] as Array<FetchCallback>;
    static readListeners = [] as Array<ReadCallback>;
    static root: TreeNode = {} as TreeNode;
    static types: Record<string, NodeType>;
    static meta: any;

    static initialize() : void {
        this.fetch();

        this.running = true;
    }

    static addFetchListener(cb: FetchCallback) : void {
        this.fetchListeners.push(cb);
    }

    static addReadListener(cb: ReadCallback) : void {
        this.readListeners.push(cb);
    }

    static callFetchListeners() : void {
        if (!this.running)
            return;

        for (const cb of this.fetchListeners) {
            cb();
        }
    }

    static callReadListeners(file: FileNode) : void {
        if (!this.running)
            return;

        for (const cb of this.readListeners) {
            cb(file);
        }
    }

    static findChildNode(node: TreeNode, query: string) : TreeNode {
        for (const child of node.children) {
            let check = '';
            if (child.type & this.types.DIR)
                check = child.path.split('/').slice(-1)[0];
            else if(child.type & this.types.FILE)
                check = child.file;

            if (check === query)
                return child;
        }

        return node;
    }

    static cwd(path: string) : TreeNode {
        if (!this.running)
            return this.root;

        if (!this.root.children)
            return this.root;

        let current = this.root;
        for (const pos of path.split('/')) {
            const next = this.findChildNode(current, pos);
            next.parent = current;
            if (next === current)
                return current;
            current = next;
        }

        return current;
    }

    static sortNodes(nodes: Array<TreeNode>) : Array<TreeNode> {
        return nodes.sort((a: TreeNode, b: TreeNode) => {
            const dir = this.types.DIR;
            const file = this.types.FILE;

            if (a.type & dir && b.type & file)
                return -1;

            if (a.type & dir && b.type & file)
                return 1;

            if (a.type & dir && b.type & dir && a.path < b.path)
                return -1;

            if (a.type & dir && b.type & dir && a.path > b.path)
                return 1;

            if (a.type & file && b.type & file && a.file < b.file)
                return -1;

            if (a.type & file && b.type & file && a.file > b.file)
                return 1;

            return 0;
        });
    }

    static fetch() : void {
        if (!Auth.authorized)
            return;

        fetch(`${apiUrl}/storage/`, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
                'x-access-token': Auth.getToken()
            }
        })
            .then((res) => res.json())
            .then((res) => {
                if (res.errors)
                    return;

                this.read('meta.json', true)
                    .then((meta) => {
                        this.root = res.tree;
                        this.types = res.types;

                        try {
                            this.meta = JSON.parse(meta.data);
                        } catch {
                            this.meta = {};
                        }

                        if (!this.meta?.tags)
                            this.write('meta.json', this.types.RAW, JSON.stringify({tags: []}, null, 2));

                        this.applyMeta(this.root, true);

                        this.callFetchListeners();
                    });
            });
    }

    static async applyMeta(root: TreeNode, generateColors = false) {
        const tags = this.meta?.tags ?? [];
        if (generateColors) {
            let index = 0;
            for (const tag of tags) {
                tag.color = hslToHex(index * (360 / tags.length), 75, 40);
                index++;
            }
        }

        for (const tag of tags) {
            const files = tag?.files ?? [];

            if (files.includes(root.path)) {
                if (!root.tags)
                    root.tags = [];

                root.tags.push(tag);
            }
        }

        for (const child of root.children) {
            this.applyMeta(child);
        }
    }

    static async read(path: string, ignoreCallbacks = false) : Promise<FileNode> {
        if (!Auth.authorized)
            return {} as FileNode;

        return fetch(`${apiUrl}/storage/read`, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
                'x-access-token': Auth.getToken()
            },
            body: JSON.stringify({
                localPath: path
            })
        })
            .then((res) => res.json())
            .then((res) => {
                if (res.errors)
                    return {} as FileNode;

                res.initial = res.data;

                if (!ignoreCallbacks)
                    this.callReadListeners(res as FileNode);

                return res as FileNode;
            });
    }

    static write(path: string, type: NodeType, data: string) : void {
        if (!Auth.authorized)
            return;

        fetch(`${apiUrl}/storage/write`, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
                'x-access-token': Auth.getToken()
            },
            body: JSON.stringify({
                localPath: path,
                type: type,
                data: data
            })
        })
            .then((res) => res.json())
            .then(() => {
                this.fetch();
            });
    }

    static upload(path: string, data: FormData) : void {
        if (!Auth.authorized)
            return;

        fetch(`${apiUrl}/storage/upload`, {
            method: 'POST',
            headers: {
                'x-access-token': Auth.getToken(),
                'local-path': path
            },
            body: data
        })
            .then((res) => res.json())
            .then(() => {
                this.fetch();
            });
    }

    static uploadFromURL(path: string, url: string) : void {
        if (!Auth.authorized)
            return;

        fetch(`${apiUrl}/storage/uploadFromURL`, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
                'x-access-token': Auth.getToken()
            },
            body: JSON.stringify({
                localPath: path,
                url: url
            })
        })
            .then((res) => res.json())
            .then(() => {
                this.fetch();
            });
    }

    static delete(path: string) : void {
        if (!Auth.authorized)
            return;

        fetch(`${apiUrl}/storage/delete`, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
                'x-access-token': Auth.getToken()
            },
            body: JSON.stringify({
                localPath: path
            })
        })
            .then((res) => res.json())
            .then(() => {
                this.fetch();
            });
    }

    static rename(path: string, name: string) : void {
        if (!Auth.authorized)
            return;

        fetch(`${apiUrl}/storage/rename`, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
                'x-access-token': Auth.getToken()
            },
            body: JSON.stringify({
                localPath: path,
                name: name
            })
        })
            .then((res) => res.json())
            .then(() => {
                this.fetch();
            });
    }
}

export default Storage;
