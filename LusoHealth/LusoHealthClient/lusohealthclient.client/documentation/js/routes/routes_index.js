var ROUTES_INDEX = {"name":"<root>","kind":"module","className":"AppModule","children":[{"name":"routes","filename":"src/app/app-routing.module.ts","module":"AppRoutingModule","children":[{"path":"","loadChildren":"./home/home.module#HomeModule","children":[{"kind":"module","children":[{"name":"routes","filename":"src/app/home/home-routing.module.ts","module":"HomeRoutingModule","children":[{"path":"home","component":"HomePageComponent"},{"path":"","component":"HomePageComponent"},{"path":"about-us","component":"AboutUsComponent"},{"path":"privacy-policy","component":"PrivacyPolicyComponent"},{"path":"terms-and-conditions","component":"TermsAndConditionsComponent"}],"kind":"module"}],"module":"HomeModule"}]},{"path":"","loadChildren":"./profile/profile.module#ProfileModule","children":[{"kind":"module","children":[{"name":"routes","filename":"src/app/profile/profile-routing.module.ts","module":"ProfileRoutingModule","children":[{"path":"edit-profile","component":"EditPerfilComponent"},{"path":"edit-professional-profile","component":"PrivateProfileProfessionalComponent"},{"path":"professional-profile","component":"PublicProfileProfessionalComponent"},{"path":"patient-profile","component":"PerfilPacienteComponent"}],"kind":"module"}],"module":"ProfileModule"}]},{"path":"","loadChildren":"./services/services.module#ServicesModule","children":[{"kind":"module","children":[{"name":"routes","filename":"src/app/services/services-routing.module.ts","module":"ServicesRoutingModule","children":[{"path":"make-appointment","component":"MarcarConsultaComponent"},{"path":"services","component":"MarcacoesComponent"},{"path":"map","component":"MapaComponent"},{"path":"payment-success","component":"PaymentSuccessComponent"},{"path":"payment-failure","component":"PaymentFailureComponent"}],"kind":"module"}],"module":"ServicesModule"}]},{"path":"","loadChildren":"./agenda/agenda.module#AgendaModule","children":[{"kind":"module","children":[{"name":"routes","filename":"src/app/agenda/agenda-routing.module.ts","module":"AgendaRoutingModule","children":[{"path":"availability","component":"DisponibilidadeComponent"},{"path":"patient-agenda","component":"AgendaPacienteComponent"},{"path":"historico-consultas","component":"HistoricoConsultasComponent"},{"path":"professional-agenda","component":"AgendaProfissionalComponent"}],"kind":"module"}],"module":"AgendaModule"}]},{"path":"","loadChildren":"./authentication/authentication.module#AuthenticationModule","children":[{"kind":"module","children":[{"name":"routes","filename":"src/app/authentication/authentication-routing.module.ts","module":"AuthenticationRoutingModule","children":[{"path":"register","component":"RegistoComponent"},{"path":"login","component":"LoginComponent"},{"path":"confirm-email","component":"ConfirmEmailComponent"},{"path":"unlock-account","component":"UnlockAccountComponent"},{"path":"reset-password","component":"AlterarPassComponent"},{"path":"external-register/:provider","component":"RegisterWithGoogleComponent"}],"kind":"module"}],"module":"AuthenticationModule"}]},{"path":"","loadChildren":"./appointment/appointment.module#AppointmentModule","children":[{"kind":"module","children":[{"name":"routes","filename":"src/app/appointment/appointment-routing.module.ts","module":"AppointmentRoutingModule","children":[{"path":"patient-appointment","component":"ConsultaPacienteComponent"},{"path":"professional-appointment","component":"ConsultaProfissionalComponent"},{"path":"chat","component":"ChatComponent"}],"kind":"module"}],"module":"AppointmentModule"}]},{"path":"not-found","component":"NotFoundComponent"},{"path":"**","component":"NotFoundComponent","pathMatch":"full"}],"kind":"module"}]}
