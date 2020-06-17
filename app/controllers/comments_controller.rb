class CommentsController < ApplicationController
  before_action :authenticate_user!

  def create
    comment = Comment.new(comment_params)

    if comment.save
      render json: { comment: comment.serialize }
    else
      render json: { errors: comment.errors.full_messages }, status: 400
    end
  end

  #TODO: Add abikity to delete comments

  private

  def comment_params
    params.require(:comment).permit(:snippet_id, :user_id, :body)
  end
end
