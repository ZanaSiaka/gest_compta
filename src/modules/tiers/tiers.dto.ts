import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateTiersDto {

    @ApiProperty({ example: 'IT INNOV', required: true })
    @IsString()
    @IsNotEmpty()
    raison_sociale!: string;

    @ApiProperty({ example: '0123456789', required: true })
    @IsString()
    @IsNotEmpty()
    nif!: string;

    @ApiProperty({ example: 'RCC-2024-001' })
    @IsString()
    @IsNotEmpty()
    rccm!: string;

}