import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";
import helpContent from "@/content/site/help";

const Search = () => {
  return (
    <div className="relative mx-auto w-full max-w-2xl">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
        <SearchIcon className="text-muted-foreground size-5" />
      </div>
      <Input
        type="text"
        placeholder={helpContent.searchPlaceholder}
        className="bg-background border-search-border text-hero-foreground placeholder:text-muted-foreground focus-visible:ring-hero-foreground focus-visible:ring-offset-hero h-14 rounded-full pl-12 text-base focus-visible:ring-2 focus-visible:ring-offset-2"
      />
    </div>
  );
};

export default Search;
