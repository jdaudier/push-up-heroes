function Layout(props) {
    return (
        <div>
            {props.children}
            <style jsx global>{`
                body { 
                    background-color: #f2f5f7;
                    background-image: url("data:image/svg+xml,%3Csvg width='6' height='6' viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2355acee' fill-opacity='0.19' fill-rule='evenodd'%3E%3Cpath d='M5 0h1L0 6V5zM6 5v1H5z'/%3E%3C/g%3E%3C/svg%3E");
                }
            `}</style>
        </div>
    )
}

export default Layout;
