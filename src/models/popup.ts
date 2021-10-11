class PopupManager {
    static popups = [] as Array<Popup>;
    static listeners = [] as Array<() => void>;

    static addListener(cb: () => void) : void {
        this.listeners.push(cb);
    }

    static callListeners() : void {
        this.listeners.forEach((cb) => {
            cb();
        });
    }

    static addPopup(msg: string, promise: Promise<void | FileNode | (() => void)>) : void {
        const popup = {
            promise: promise,
            message: msg,
            done: false,
            timeDone: null,
            ok: null
        } as Popup;

        const removePopup = () => {
            this.callListeners();
            setTimeout(() => {
                this.popups = this.popups.filter((item) => item !== popup);
                this.callListeners();
            }, 2000);
        };

        popup.promise.then(() => {
            popup.done = true;
            popup.ok = true;
            popup.timeDone = new Date();
            removePopup();
        });

        popup.promise.catch(() => {
            popup.done = true;
            popup.ok = false;
            popup.timeDone = new Date();
            removePopup();
        });

        this.popups.push(popup);
        this.callListeners();
    }
}

export default PopupManager;
