import {IsNotEmpty, IsArray, IsString} from 'class-validator';

export class TeamDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsArray()
    members: Array<{
        userId: string;
        role: string;
        username : string;
    }>;

    @IsNotEmpty()
    @IsString()
    joinCode: string;
}
