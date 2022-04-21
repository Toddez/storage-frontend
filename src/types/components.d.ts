declare type TreeNode = {
  children: Array<TreeNode>;
  type: number;
  path: string;
  file: string;
  extension: string;
  parent: TreeNode | null;
};

declare type NodeType = number;

declare type FileNode = {
  extension: string;
  data: string;
  type: number;
  lines: number;
  size: number;
  file: string;
  initial: string;
  path: string;
};

declare type FetchCallback = () => void;
declare type ReadCallback = (file: FileNode) => void;

declare type Popup = {
  promise: Promise | null;
  message: string;
  done: boolean;
  timeDone: Date | null;
  ok: boolean | null;
};

declare type PopupCallback = (res: number) => void;

declare interface PreviewProps {
  cwd: TreeNode;
  types: Record<string, number>;
  handleNodeActionClick: (event: ClickEvent<T>) => void;
  isEditing: boolean;
  onEdit: (node: TreeNode, data: string) => void;
  linkCallback: (href: string) => void;
  offset: number;
  innerRef: RefObject<HTMLElement>;
}

declare interface ModalProps {
  hide: () => void;
  submit: (data: Record<string, unknown>) => void;
}

declare interface ClickTarget extends EventTarget {
  text: string;
  value: string;
  parentElement: HTMLElement;
  classList: Array<string>;
}

declare type FormState = {
  data: Record<string, unknown | string | number | boolean>;
};

declare interface ClickEvent<T> extends React.MouseEvent<T, MouseEvent> {
  target: ClickTarget;
}

declare interface StorageImageProps {
  src: string;
}

declare interface StorageVideoProps {
  src: string;
}

declare interface StorageLinkProps {
  href: string;
  local: boolean;
  valid: boolean;
  children: HTMLElement[];
  callback: (href: string) => void;
}
