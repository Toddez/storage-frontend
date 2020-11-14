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

declare interface ModalProps {
    hide: () => void,
    submit: (data: Record<string, unknown>) => void,
    cwd: TreeNode,
    data: Record<string, any>
}

declare interface ClickTarget extends EventTarget {
    text: string,
    parentElement: HTMLElement,
    classList: Array<string>
}

declare type FormState = {
    data: Record<string, string>
}

declare interface ClickEvent extends React.MouseEvent<HTMLAnchorElement, MouseEvent> {
    target: ClickTarget,
}
