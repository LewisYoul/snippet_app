class RegistrationsController < Devise::RegistrationsController
  layout 'application', only: :edit

  def create
    respond_to do |format|
      format.html { super }
      format.json do
        user = User.new(user_params)

        if user.save
          render json: { message: 'Thanks for signing up, please confirm your email to sign in.' }
        else
          render json: { message: 'There was a problem creating your account.' }, status: 400
        end
      end
    end
  end

  def edit
    @tab_id = params[:tab_id] || :account
    super
  end

  def update
    current_user.updated_at = Time.now
    current_user.avatar.attach(params[:user][:avatar])
    current_user.save!
    # if current_user.update(account_update_params)
    #   render json: { message: "Profile updated" }
    # else
    #   render json: { message: "Failed to update profile" }, status: 400
    # end
  end

  private

  def user_params
    params.require(:user).permit(:email, :name, :password, :password_confirmation)
  end
end
