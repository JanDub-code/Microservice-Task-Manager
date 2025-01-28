import { IsString, IsMongoId, Length } from "class-validator";

export class NotificationCreateDto {

    @IsString()
    teamId: string;

    @IsString()
    userId: string;

    @IsString()
    @Length(1, 500)
    text: string;
}
