// src/app/fanhub/components/FanHubTalkItem.tsx

"use client";

import { useFanHubTalkItem } from "@/app/fanhub/hooks/useFanHubTalkItem";

import MessageHeader from "./item/MessageHeader";
import MessageMedia from "./item/MessageMedia";

import ActionBar from "./item/ActionBar";
import CommentList from "@/components/comments/CommentList";
import CommentInput from "@/components/comments/CommentInput";
import BottomSheet from "@/components/ui/BottomSheet";

export default function FanHubTalkItem({ message, isDetail = false }: any) {
  const {
    user,
    showComments,
    setShowComments,
    comments,
    likeCount,
    isLiked,
    toggleLike,
    commentCount,
    replyTarget,
    handleStartReply,
    handleCommentSubmit,
    handleReplySubmit,
    handleEdit,
    handleDelete,
    toggleCommentLike,
    toggleReplyLike,
  } = useFanHubTalkItem(message);

  return (
    <>
      <div className="w-full py-3 border-b border-gray-200 dark:border-neutral-700 md:px-4">

        {/* Avatar + nickname + time + text + tags */}
        <MessageHeader message={message} />

        {/* media */}
        <MessageMedia
          url={message.mediaUrl}
          type={message.mediaType}
          fallbackImage={message.imageUrl}
          messageId={isDetail ? undefined : message.id}
          clickToOpenFull={isDetail}
        />


        {/* action bar */}
        <ActionBar
          likeCount={likeCount}
          commentCount={commentCount}
          isLiked={isLiked}
          onLike={toggleLike}
          onCommentClick={() => setShowComments(true)}
          shareUrl={`https://sportsive.app/fanhub/${message.id}`}   // ⭐ URL
          shareText={message.text}                                  // ⭐ 옵션
        />

      </div>


      <BottomSheet
        open={showComments}
        onClose={() => setShowComments(false)}
        title="Comments"
      >
        <CommentList
          comments={comments}
          user={user}
          replyTarget={replyTarget}
          onStartReply={handleStartReply}
          onCommentSubmit={handleCommentSubmit}
          onReplySubmit={handleReplySubmit}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onLikeComment={toggleCommentLike}
          onLikeReply={toggleReplyLike}
        />

        {user && (
          <div
            className="
              fixed bottom-0 left-0 right-0 
              bg-white dark:bg-neutral-900 
              px-4 py-3 border-t 
              border-gray-200 dark:border-gray-700 
              z-[200]
            "
          >
            {replyTarget && (
              <div className="text-xs text-gray-500 mb-1">
                Replying to @
                {comments.find((c) => c.id === replyTarget)?.authorNickname}
              </div>
            )}

            <CommentInput
              onSubmit={(text) => {
                if (replyTarget) {
                  handleReplySubmit(replyTarget, text);
                } else {
                  handleCommentSubmit(text);
                }
              }}
              placeholder={
                replyTarget ? "Write a reply..." : "Add a comment..."
              }
            />
          </div>
        )}
      </BottomSheet>
    </>
  );
}
