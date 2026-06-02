import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateUserDto {

    @ApiProperty({ example: 'Doe', required: true })
    @IsString()
    @IsNotEmpty()
    nom!: string;

    @ApiProperty({ example: 'John', required: true })
    @IsString()
    @IsNotEmpty()
    prenom!: string;

    @ApiProperty({ example: 'john.doe@example.com', required: true })
    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @ApiProperty({ example: 'uuid-du-role' })
    @IsUUID()
    @IsNotEmpty()
    role_id!: string;
}

export class UpdateUserDto {
    @ApiProperty({ example: 'Doe', required: false })
    @IsString()
    @IsOptional()
    nom?: string;

    @ApiProperty({ example: 'John', required: false })
    @IsString()
    @IsOptional()
    prenom?: string;

    @ApiProperty({ example: 'uuid-du-role', required: false })
    @IsUUID()
    @IsOptional()
    role_id?: string;

    @ApiProperty({ example: true, required: false })
    @IsBoolean()
    @IsOptional()
    est_actif?: boolean;
}
