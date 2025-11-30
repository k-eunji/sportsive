//src/components/common/CommentFilter.tsx

type SortOption = "latest" | "popular" | "oldest";

type CommentFilterProps = {
  currentSort: SortOption;
  onChangeSort: (sort: SortOption) => void;
};

export function CommentFilter({ currentSort, onChangeSort }: CommentFilterProps) {
  return (
    <div className="comment-filter flex gap-4 mb-4">
      <button
        className={currentSort === "latest" ? "font-bold underline" : ""}
        onClick={() => onChangeSort("latest")}
      >
        최신순
      </button>
      <button
        className={currentSort === "popular" ? "font-bold underline" : ""}
        onClick={() => onChangeSort("popular")}
      >
        인기순
      </button>
      <button
        className={currentSort === "oldest" ? "font-bold underline" : ""}
        onClick={() => onChangeSort("oldest")}
      >
        오랜된 순
      </button>
    </div>
  );
}
