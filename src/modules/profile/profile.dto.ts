import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, Matches, MinLength } from "class-validator";

export class UpdateProfileDto {

    @ApiProperty({ example: 'Dupont', required: false })
    @IsString()
    @IsOptional()
    nom?: string;

    @ApiProperty({ example: 'Jean', required: false })
    @IsString()
    @IsOptional()
    prenom?: string;

}

export class UpdatePasswordDto {
    @ApiProperty({ example: 'OldPassword23' })
    @IsString()
    @IsNotEmpty()
    old_password!: string;

    @ApiProperty({ example: 'NewPassword123' })
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message: 'Doit contenir au moins une majuscule, une minuscule et un chiffre'
    })
    new_password!: string;
}