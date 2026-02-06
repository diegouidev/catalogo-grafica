"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// Correção: Inferir os tipos diretamente do componente em vez de importar de 'dist/types'
export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
    return (
        <NextThemesProvider
            attribute="class"
            defaultTheme="dark" // Cloud Design fica incrível em Dark Mode
            enableSystem={true}
            {...props}
        >
            {children}
        </NextThemesProvider>
    );
}