import { NextRequest, NextResponse } from "next/server";
import { createSession } from "@/lib/server/auth-session";
import { config } from "@/lib/server/config";

// Usuarios demo (en producción usar Notion como base de datos)
const DEMO_USERS = [
  { id: "1", username: "admin", password: "admin123", role: "admin" as const, name: "Administrador" },
  { id: "2", username: "vendedor1", password: "1234", role: "vendor" as const, name: "Vendedor Demo" },
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Usuario y contraseña requeridos" },
        { status: 400 }
      );
    }

    // Buscar usuario (demo) - en producción query a Notion
    const user = DEMO_USERS.find(
      (u) => u.username === username && u.password === password
    );

    if (!user) {
      return NextResponse.json(
        { error: "Credenciales incorrectas" },
        { status: 401 }
      );
    }

    // Crear sesión
    await createSession({
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
