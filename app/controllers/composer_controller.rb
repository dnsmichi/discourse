class ComposerController < ApplicationController
  requires_login

  def parse_html
    render json: { markdown: PrettyText.html_to_markdown(params[:html]) }
  end
end
