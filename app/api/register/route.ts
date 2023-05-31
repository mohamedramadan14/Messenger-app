import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import prisma from "@/app/libs/prismaDb";

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const { email, password, name } = body;
		if (!email || !password || !name) {
			return new NextResponse("Missing required info", { status: 400 });
		}

		const hasedPassword = await bcrypt.hash(password, 12);

		const user = await prisma.user.create({
			data: {
				email,
				name,
				hasedPassword,
			},
		});

		return NextResponse.json(user);
	} catch (error: any) {
		console.log(error, "REGISTERATION_ERROR");
		return new NextResponse("Internal Error", { status: 500 });
	}
}
