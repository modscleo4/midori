import Request from "../http/Request.js";
import User from "./User.js";

export default abstract class Auth {
    abstract authenticate(request: Request): Promise<User>;

    abstract attempt(request: Request): Promise<User | null>;

    abstract authorize(request: Request, user: User): Promise<boolean>;

    abstract logout(request: Request, user: User): Promise<void>;
}
