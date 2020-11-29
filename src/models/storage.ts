import Auth from '../models/auth';
import { apiUrl } from '../models/config';

class Storage {
    static running = false;
    static listeners = [] as Array<() => void>;
    static root: TreeNode = {} as TreeNode;
    static types: Record<string, NodeType>

    static initialize() : void {
        if (this.running)
            return;

        this.fetch();

        this.running = true;
    }

    static addListener(cb: () => void) : void {
        this.listeners.push(cb);
    }

    static callListeners() : void {
        if (!this.running)
            return;

        for (const cb of this.listeners) {
            cb();
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
            method: 'GET',
            headers: {
                'Content-type': 'application/json',
                'x-access-token': Auth.getToken()
            }
        })
            .then((res) => res.json())
            .then((res) => {
                if (res.errors)
                    return;

                this.root = res.tree;
                this.types = res.types;
                this.callListeners();
            });
    }

    static write(path: string, type: NodeType, data: string) : void {
        fetch(`${apiUrl}/storage/write/${path}`, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
                'x-access-token': Auth.getToken()
            },
            body: JSON.stringify({
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
        fetch(`${apiUrl}/storage/upload/${path}`, {
            method: 'POST',
            headers: {
                'x-access-token': Auth.getToken()
            },
            body: data
        })
            .then((res) => res.json())
            .then(() => {
                this.fetch();
            });
    }

    static delete(path: string) : void {
        fetch(`${apiUrl}/storage/delete/${path}`, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
                'x-access-token': Auth.getToken()
            }
        })
            .then((res) => res.json())
            .then(() => {
                this.fetch();
            });
    }

    static rename(path: string, name: string) : void {
        fetch(`${apiUrl}/storage/rename/${path}`, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
                'x-access-token': Auth.getToken()
            },
            body: JSON.stringify({
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
