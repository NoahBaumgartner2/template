class PagesController < ApplicationController
  def home; end
  def leistungen; end
  def team; end
  def kontakt; end

  def contact_submit
    redirect_to kontakt_path, notice: "Vielen Dank! Ihre Nachricht wurde übermittelt. Wir melden uns so schnell wie möglich bei Ihnen."
  end
end
