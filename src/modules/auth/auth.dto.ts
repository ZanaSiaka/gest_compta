import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, IsUUID, Matches, MinLength } from "class-validator";

export class LoginDto {
    @ApiProperty({ example: 'example.test@gmail.com', required: true })
    @IsEmail({}, { message: 'Ce doit doit être un email' })
    @IsNotEmpty({ message: 'Ce champ ne doit pas être vide' })
    email!: string;

    @ApiProperty({ example: 'Password123', required: true })
    @IsString({ message: 'Doit être une chaine de caratère' })
    @MinLength(8, { message: 'Doit avoir au moins 8 caractères' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, { message: 'Doit contenir au moins une majuscule, une miniscule et un chiffre' })
    @IsNotEmpty({ message: 'Ne doit pas être vide' })
    password!: string;

}

export class GenerateTokenDto {
    @ApiProperty({ example: '4254-5861-4851-2581' })
    @IsUUID()
    @IsNotEmpty()
    user_id!: string;

    @ApiProperty({ example: 'user@gmail.com' })
    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @ApiProperty({ example: '4254-5861-4851-2581' })
    @IsUUID()
    @IsNotEmpty()
    entreprise_id!: string;

    @ApiProperty({ example: 'Johnn' })
    @IsString()
    @IsNotEmpty()
    prenom!: string;

    @ApiProperty({ example: 'Doe' })
    @IsString()
    @IsNotEmpty()
    nom!: string;
}

