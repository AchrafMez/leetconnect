import {useEffect} from "react";
import {useLocation} from "react-router-dom";

export function ScrollToTop() {
    const {pathname, hash} = useLocation();

    useEffect(() => {
        if (hash){
            setTimeout(() => {
                const id = hash.replace('#', '');
                const element = document.getElementById(id);
                if (element)
                    element.scrollIntoView({behavior: "smooth"});
            }, 100);
            return;
        }

        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "instant",
        });
    }, [pathname, hash]);

    return null;
}
