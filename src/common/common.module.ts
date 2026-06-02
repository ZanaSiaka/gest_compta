import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { PermissionService } from "./services/permission.service";

@Module({
    imports: [PrismaModule],
    providers: [PermissionService],
    exports: [PermissionService]
})

export class CommonModule { }