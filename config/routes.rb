Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  root "pages#home"
  get  "/leistungen"     => "pages#leistungen",    as: :leistungen
  get  "/team"           => "pages#team",          as: :team
  get  "/kontakt"        => "pages#kontakt",        as: :kontakt
  post "/kontakt/senden" => "pages#contact_submit", as: :contact_submit
end
