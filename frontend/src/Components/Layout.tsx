import Aside from "./Aside";
import Navbar from "./Navbar";
import SuggestedFriends from "./SuggestedFriends";

interface IDataLayout {
    children: React.ReactNode,
    showNav: boolean,
}

export default function Layout({ children, showNav }: IDataLayout) {
    return (
        <>
            {showNav && (
                <div>
                    <Navbar />
                    <div className="container px-[10px] xl:px-[50px] pt-8 flex flex-col md:flex-row justify-between gap-6  h-full ">
                        <Aside />
                        {children}
                        <SuggestedFriends />
                    </div>
                </div>
            )}
        </>
    )
}
