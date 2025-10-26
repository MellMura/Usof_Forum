import React from 'react';
import PropTypes from 'prop-types';
import Comment from './Comment';
import './Comment.css';

export default function CommentsThread({ node, onReply, currentUserId, postAuthorId, isAdmin, postActive, canReply, disabledReason }) {
  const {
    id,
    author_id,
    author,
    author_status,
    author_rating,
    pic_url,
    created_at,
    content,
    likes = 0,
    dislikes = 0,
    myReaction = null,
    children = [],
    locked = 0,
    status = 'active',
  } = node || {};

  return (
    <div className="comment_thread">
      <Comment
        id={id}
        authorId={author_id}
        author={author}
        userStatus={author_status || 'user'}
        authorRating={author_rating}
        authorPicUrl={pic_url}
        createdAt={created_at}
        content={content || ''}
        likes={likes}
        dislikes={dislikes}
        myReaction={myReaction}
        fetchOnMount={true}
        onReplySubmit={(commentId, text) => onReply(commentId, text)}
        currentUserId={currentUserId}
        postAuthorId={postAuthorId}
        isAdmin={isAdmin}
        locked={node.locked}
        postActive={postActive}
        status={status}
        allowReply={!!canReply}
        disabledReason={disabledReason}
      />

      {children.length > 0 && (
        <div className="comment_children">
          {children.map(child => (
            <CommentsThread 
              key={child.id}
              node={child}
              onReply={onReply}
              currentUserId={currentUserId}
              postAuthorId={postAuthorId}
              isAdmin={isAdmin}
              postActive={postActive}
              canReply={canReply}
              disabledReason={disabledReason}
            />
          ))}
        </div>
      )}
    </div>
  );
}

CommentsThread.propTypes = {
    node: PropTypes.shape({
      id: PropTypes.number.isRequired,
      author_id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      author: PropTypes.string,
      author_status: PropTypes.string,
      author_rating: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      pic_url: PropTypes.string,
      created_at: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      content: PropTypes.string,
      likes: PropTypes.number,
      dislikes: PropTypes.number,
      myReaction: PropTypes.oneOf(['like', 'dislike', null]),
      children: PropTypes.array,
      currentUserId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      postAuthorId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      isAdmin: PropTypes.bool,
      postActive: PropTypes.bool,
      locked: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]),
      status: PropTypes.oneOf(['active', 'inactive']),
    }).isRequired,
    onReply: PropTypes.func.isRequired,
    currentUserId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    postAuthorId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    isAdmin: PropTypes.bool,
    postActive: PropTypes.bool,
    canReply: PropTypes.bool,
    disabledReason: PropTypes.string, 
  };