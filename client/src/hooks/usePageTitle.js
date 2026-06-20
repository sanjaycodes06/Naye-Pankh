import { useEffect } from "react";

const usePageTitle = (title) => {
  useEffect(() => {
    document.title = title
      ? `${title} — NayePankh Foundation`
      : "NayePankh Foundation";
    return () => { document.title = "NayePankh Foundation"; };
  }, [title]);
};

export default usePageTitle;
