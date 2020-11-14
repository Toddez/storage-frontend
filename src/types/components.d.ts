declare type TreeNode = {
    children: Array<TreeNode>,
    type: number,
    path: string,
    file: string,
    extension: string
}

declare interface PreviewProps {
    cwd: TreeNode,
    types: Record<string, number>
}
