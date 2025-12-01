function PublicLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html>
            <body>
                <div>
                    Publico
                    {children}
                </div>
            </body>
        </html>
    );
}


export default PublicLayout;