"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useSearchParams } from "next/navigation";
import { useIsFetching, useIsMutating } from "@tanstack/react-query";

export function PageLoader() {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timeout);
  }, [pathname, searchParams]);

  const showLoader = loading || isFetching > 0 || isMutating > 0;

  return (
    <AnimatePresence mode="wait">
      {showLoader && (
        <motion.div
          initial={{ width: 0, opacity: 1 }}
          animate={{ width: "100%", opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="bg-primary fixed top-0 left-0 z-50 h-1"
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{
              duration: 2,
              ease: "linear",
              repeat: Infinity,
            }}
            className="h-full w-full bg-white/20"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
