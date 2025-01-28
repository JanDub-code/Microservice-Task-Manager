import 'reflect-metadata';
import {Request, Response} from 'express';
import {validateQuery} from "../../../middleware/validation.middleware";
import {SearchQuery} from "../../../types/base.dto";
import {userService} from "../../../business/user.service";

export class UserController {

    async search(req: Request, res: Response) {
        const {query} = await validateQuery(req, SearchQuery)
        const users = await userService.searchByName(query)
        res.status(200).send(users)
    }

    async getUserReservations(req: Request, res: Response) {
        const user = res.locals.oauth?.token?.user
        const userData = await userService.getByEmail(user.email)

        if (!userData) {
            res.status(404).send()
            return
        }

        res.status(200).send(userData.reservations)
    }

}
