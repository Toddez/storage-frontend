import Auth from "../models/auth";
import { apiUrl } from "../models/config";
import PopupManager from "./popup";

class Storage {
  static running = false;
  static fetchListeners = [] as Array<FetchCallback>;
  static readListeners = [] as Array<ReadCallback>;
  static root: TreeNode = {} as TreeNode;
  static types: Record<string, NodeType>;

  static initialize(): void {
    this.fetch();

    this.running = true;
  }

  static addFetchListener(cb: FetchCallback): void {
    this.fetchListeners.push(cb);
  }

  static addReadListener(cb: ReadCallback): void {
    this.readListeners.push(cb);
  }

  static callFetchListeners(): void {
    if (!this.running) return;

    for (const cb of this.fetchListeners) {
      cb();
    }
  }

  static callReadListeners(file: FileNode): void {
    if (!this.running) return;

    for (const cb of this.readListeners) {
      cb(file);
    }
  }

  static findChildNode(node: TreeNode, query: string): TreeNode {
    for (const child of node.children) {
      let check = "";
      if (child.type & this.types.DIR)
        check = child.path.split("/").slice(-1)[0];
      else if (child.type & this.types.FILE) check = child.file;

      if (check === query) return child;
    }

    return node;
  }

  static cwd(path: string): TreeNode {
    if (!this.running) return this.root;

    if (!this.root.children) return this.root;

    let current = this.root;
    for (const pos of path.split("/")) {
      const next = this.findChildNode(current, pos);
      next.parent = current;
      if (next === current) return current;
      current = next;
    }

    return current;
  }

  static sortNodes(nodes: Array<TreeNode>): Array<TreeNode> {
    return nodes.sort((a: TreeNode, b: TreeNode) => {
      const dir = this.types.DIR;
      const file = this.types.FILE;

      if (a.type & dir && b.type & file) return -1;

      if (a.type & dir && b.type & file) return 1;

      if (a.type & dir && b.type & dir && a.path < b.path) return -1;

      if (a.type & dir && b.type & dir && a.path > b.path) return 1;

      if (a.type & file && b.type & file && a.file < b.file) return -1;

      if (a.type & file && b.type & file && a.file > b.file) return 1;

      return 0;
    });
  }

  static fetch(): void {
    if (!Auth.authorized) return;

    fetch(`${apiUrl}/storage/`, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
        "x-access-token": Auth.getToken(),
      },
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.errors) return;

        this.root = res.tree;
        this.types = res.types;
        this.callFetchListeners();
      });
  }

  static async read(path: string, ignoreCallbacks = false): Promise<FileNode> {
    if (!Auth.authorized) return {} as FileNode;

    return fetch(`${apiUrl}/storage/read`, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
        "x-access-token": Auth.getToken(),
      },
      body: JSON.stringify({
        localPath: path,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.errors) return {} as FileNode;

        res.initial = res.data;

        if (!ignoreCallbacks) this.callReadListeners(res as FileNode);

        return res as FileNode;
      });
  }

  static write(path: string, type: NodeType, data: string): void {
    if (!Auth.authorized) return;

    PopupManager.addPopup(
      `Write to file: ${path}`,
      fetch(`${apiUrl}/storage/write`, {
        method: "POST",
        headers: {
          "Content-type": "application/json",
          "x-access-token": Auth.getToken(),
        },
        body: JSON.stringify({
          localPath: path,
          type: type,
          data: data,
        }),
      }),
      () => {
        this.fetch();
      }
    );
  }

  static upload(path: string, data: FormData): void {
    if (!Auth.authorized) return;

    PopupManager.addPopup(
      `Upload file(s)`,
      fetch(`${apiUrl}/storage/upload`, {
        method: "POST",
        headers: {
          "x-access-token": Auth.getToken(),
          "local-path": path,
        },
        body: data,
      }),
      () => {
        this.fetch();
      }
    );
  }

  static uploadFromURL(path: string, url: string): void {
    if (!Auth.authorized) return;

    PopupManager.addPopup(
      `Upload from URL: ${url.split("/").pop()}`,
      fetch(`${apiUrl}/storage/uploadFromURL`, {
        method: "POST",
        headers: {
          "Content-type": "application/json",
          "x-access-token": Auth.getToken(),
        },
        body: JSON.stringify({
          localPath: path,
          url: url,
        }),
      }),
      () => {
        this.fetch();
      }
    );
  }

  static delete(path: string): void {
    if (!Auth.authorized) return;

    PopupManager.addPopup(
      `Delete: ${path}`,
      fetch(`${apiUrl}/storage/delete`, {
        method: "POST",
        headers: {
          "Content-type": "application/json",
          "x-access-token": Auth.getToken(),
        },
        body: JSON.stringify({
          localPath: path,
        }),
      }),
      () => {
        this.fetch();
      }
    );
  }

  static rename(path: string, name: string): void {
    if (!Auth.authorized) return;

    PopupManager.addPopup(
      `Rename: ${path} to ${name}`,
      fetch(`${apiUrl}/storage/rename`, {
        method: "POST",
        headers: {
          "Content-type": "application/json",
          "x-access-token": Auth.getToken(),
        },
        body: JSON.stringify({
          localPath: path,
          name: name,
        }),
      }),
      () => {
        this.fetch();
      }
    );
  }
}

export default Storage;
