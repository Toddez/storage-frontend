declare type TreeNode = {
    children: Array<TreeNode>,
    type: number,
    path: string,
    file: string,
    extension: string,
    parent: TreeNode | null
}

declare interface PreviewProps {
    cwd: TreeNode,
    types: Record<string, number>,
    handleNodeActionClick: (event: ClickEvent<T>) => void
}

declare interface ModalProps {
    hide: () => void,
    submit: (data: Record<string, unknown>) => void
}

declare interface ClickTarget extends EventTarget {
    text: string,
    value: string,
    parentElement: HTMLElement,
    classList: Array<string>
}

declare type FormState = {
    data: Record<string, string | number | boolean>
}

declare interface ClickEvent<T> extends React.MouseEvent<T, MouseEvent> {
    target: ClickTarget,
}
