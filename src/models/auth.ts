class Auth {
    static jwt = '';
    static data: Record<string, unknown> = {};

    static getToken = () : string => Auth.jwt;
    static setToken = (jwt: string) : void => {
        Auth.jwt = jwt;
    }

    static getData = <T>(key: string) : T => Auth.data[key] as T;
    static setData = (key: string, value: unknown) : void => {
        Auth.data[key] = value;
    }

    static authorized = () : boolean => {
        if (!Auth.jwt)
            return false;

        if (Object.keys(Auth.data).length === 0)
            return false;

        return true;
    }
}

export default Auth;
