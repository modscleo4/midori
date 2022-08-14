export default abstract class User {
    #id: string;

    constructor(id: string, public username: string, public password: string) {
        this.#id = id;
    }
}
