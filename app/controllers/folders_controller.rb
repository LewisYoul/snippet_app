class FoldersController < ApplicationController
  MINIMUM_FOLDERS = 1.freeze

  before_action :authenticate_user!
  before_action :set_folder, only: %i(show update destroy)
  before_action :require_minimum_folders, only: :destroy

  def index
    @page_title = 'Folders'

    @folders = current_user.folders.order(name: :asc)
  end

  def search
    folders = current_user.folders
      .includes([:snippets, :snippet_folders])
      .where('name ILIKE ?', "%#{search_params[:search_term]}%")
      .order(created_at: :desc)
      .offset(offset)
      .limit(params[:per_page])
      .map { |folder| FolderSerializer.new(folder).to_h }

    render json: { items: folders }
  end

  def show
    @page_title = @folder.name
    @snippets = @folder.snippets.order(created_at: :desc).map { |s| s.serialize(current_user) }
  end

  def new
    @page_title = 'New Folder'
  end

  def create
    @folder = Folder.create!(folder_params.merge(user: current_user))

    flash[:notice] = 'New folder created!'

    redirect_to folders_path
  end

  def update
    if @folder.update(folder_params)
      render json: { message: 'Folder updated!' }
    else
      render json: { message: 'Unable to update folder' }
    end
  end

  def destroy
    if @folder.destroy
      render json: { message: 'Folder deleted!' }
    else
      render json: { message: 'Unable to delete folder' }, status: 400
    end
  end

  # Remove this once all routes no longer use JSON
  def unfile_snippet
    snippet_folder = current_user.snippet_folders.find_by(snippet_id: params[:snippet_id])

    if snippet_folder && snippet_folder.destroy
      render json: { message: 'Snippet removed from folder!' }
    else
      render json: { message: 'Failed to remove snippet from folder' }
    end
  end

  # Remove this once all routes no longer use JSON
  def file_snippet
    begin
      snippet = Snippet.find(params[:snippet_id])
      
      @folder = current_user.folders.find_by(id: params[:folder_id])

      @folder.snippets << snippet
      
      render json: { message: 'Added snippet to folder' }
    rescue ActiveRecord::RecordInvalid => e
      render json: { message: e.record.errors.full_messages.join(', ') }, status: 400
    end
  end

  private

  def set_folder
    unless @folder = current_user.folders.find_by(id: params[:id])
      respond_to do |format|
        format.html { redirect_to root_path, alert: UNAUTHORIZED }
        format.json { render json: { message: UNAUTHORIZED }, status: 401 }
      end
    end
  end

  def require_minimum_folders
    if current_user.folders.size <= MINIMUM_FOLDERS
      render json: { message: 'Unable to delete your only folder' }, status: 400
    end
  end

  def folder_params
    params.require(:folder).permit(:name)
  end

  def search_params
    params.permit(:search_term, :page, :per_page)
  end

  def offset
    (search_params[:page].to_i - 1) * search_params[:per_page].to_i 
  end
end
