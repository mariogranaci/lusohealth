'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">lusohealthclient.client documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                        <li class="link">
                            <a href="overview.html" data-type="chapter-link">
                                <span class="icon ion-ios-keypad"></span>Overview
                            </a>
                        </li>
                        <li class="link">
                            <a href="index.html" data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>README
                            </a>
                        </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="properties.html" data-type="chapter-link">
                                        <span class="icon ion-ios-apps"></span>Properties
                                    </a>
                                </li>
                    </ul>
                </li>
                    <li class="chapter modules">
                        <a data-type="chapter-link" href="modules.html">
                            <div class="menu-toggler linked" data-bs-toggle="collapse" ${ isNormalMode ?
                                'data-bs-target="#modules-links"' : 'data-bs-target="#xs-modules-links"' }>
                                <span class="icon ion-ios-archive"></span>
                                <span class="link-name">Modules</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                        </a>
                        <ul class="links collapse " ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                            <li class="link">
                                <a href="modules/AgendaModule.html" data-type="entity-link" >AgendaModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-AgendaModule-0c52e1cd1f23f4f5830787e770bc0a8656d7d3c5dbee49d19632eddfd7343568020dce5f242579a1d5fa89cb7a06573a059deb0747164fdd716278583229b758"' : 'data-bs-target="#xs-components-links-module-AgendaModule-0c52e1cd1f23f4f5830787e770bc0a8656d7d3c5dbee49d19632eddfd7343568020dce5f242579a1d5fa89cb7a06573a059deb0747164fdd716278583229b758"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-AgendaModule-0c52e1cd1f23f4f5830787e770bc0a8656d7d3c5dbee49d19632eddfd7343568020dce5f242579a1d5fa89cb7a06573a059deb0747164fdd716278583229b758"' :
                                            'id="xs-components-links-module-AgendaModule-0c52e1cd1f23f4f5830787e770bc0a8656d7d3c5dbee49d19632eddfd7343568020dce5f242579a1d5fa89cb7a06573a059deb0747164fdd716278583229b758"' }>
                                            <li class="link">
                                                <a href="components/AgendaPacienteComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AgendaPacienteComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AgendaProfissionalComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AgendaProfissionalComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DisponibilidadeComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DisponibilidadeComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/HistoricoConsultasComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >HistoricoConsultasComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/AgendaRoutingModule.html" data-type="entity-link" >AgendaRoutingModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/AppModule.html" data-type="entity-link" >AppModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-AppModule-102e70afd21f74b716a10f1e4306f537920264b9ab860aef2a11c8cb8b38094fe8a4c536a511b4e07856f9748f2add0d2e5636cf38ddbc1c933126065c123ef1"' : 'data-bs-target="#xs-components-links-module-AppModule-102e70afd21f74b716a10f1e4306f537920264b9ab860aef2a11c8cb8b38094fe8a4c536a511b4e07856f9748f2add0d2e5636cf38ddbc1c933126065c123ef1"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-AppModule-102e70afd21f74b716a10f1e4306f537920264b9ab860aef2a11c8cb8b38094fe8a4c536a511b4e07856f9748f2add0d2e5636cf38ddbc1c933126065c123ef1"' :
                                            'id="xs-components-links-module-AppModule-102e70afd21f74b716a10f1e4306f537920264b9ab860aef2a11c8cb8b38094fe8a4c536a511b4e07856f9748f2add0d2e5636cf38ddbc1c933126065c123ef1"' }>
                                            <li class="link">
                                                <a href="components/AppComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AppComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/FooterComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FooterComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/NavbarComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >NavbarComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/AppointmentModule.html" data-type="entity-link" >AppointmentModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-AppointmentModule-24a105df2846ce832f462c905f7f05bc516bab2a673f144eb81903ef767e11c7bc6a068431f5d54d2c31fb6b9a797f52201f87941de7676fa4893c4dd4f635b1"' : 'data-bs-target="#xs-components-links-module-AppointmentModule-24a105df2846ce832f462c905f7f05bc516bab2a673f144eb81903ef767e11c7bc6a068431f5d54d2c31fb6b9a797f52201f87941de7676fa4893c4dd4f635b1"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-AppointmentModule-24a105df2846ce832f462c905f7f05bc516bab2a673f144eb81903ef767e11c7bc6a068431f5d54d2c31fb6b9a797f52201f87941de7676fa4893c4dd4f635b1"' :
                                            'id="xs-components-links-module-AppointmentModule-24a105df2846ce832f462c905f7f05bc516bab2a673f144eb81903ef767e11c7bc6a068431f5d54d2c31fb6b9a797f52201f87941de7676fa4893c4dd4f635b1"' }>
                                            <li class="link">
                                                <a href="components/ChatComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ChatComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ConsultaPacienteComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ConsultaPacienteComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ConsultaProfissionalComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ConsultaProfissionalComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/AppointmentRoutingModule.html" data-type="entity-link" >AppointmentRoutingModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/AppRoutingModule.html" data-type="entity-link" >AppRoutingModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/AuthenticationModule.html" data-type="entity-link" >AuthenticationModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-AuthenticationModule-19b59c6c93f27bd2642d605034587be081cc7c41a04f429472ec49df9928486844440e76ec314823e401d2f0378183f89dc9d2db816883a41ce3dbefc4dd4b36"' : 'data-bs-target="#xs-components-links-module-AuthenticationModule-19b59c6c93f27bd2642d605034587be081cc7c41a04f429472ec49df9928486844440e76ec314823e401d2f0378183f89dc9d2db816883a41ce3dbefc4dd4b36"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-AuthenticationModule-19b59c6c93f27bd2642d605034587be081cc7c41a04f429472ec49df9928486844440e76ec314823e401d2f0378183f89dc9d2db816883a41ce3dbefc4dd4b36"' :
                                            'id="xs-components-links-module-AuthenticationModule-19b59c6c93f27bd2642d605034587be081cc7c41a04f429472ec49df9928486844440e76ec314823e401d2f0378183f89dc9d2db816883a41ce3dbefc4dd4b36"' }>
                                            <li class="link">
                                                <a href="components/AlterarPassComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AlterarPassComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ConfirmEmailComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ConfirmEmailComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/FooterAuthenticationComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FooterAuthenticationComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/LoginComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >LoginComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/RecuperarContaComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >RecuperarContaComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/RecuperarPassComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >RecuperarPassComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/RegisterWithGoogleComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >RegisterWithGoogleComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/RegistoComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >RegistoComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/UnlockAccountComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UnlockAccountComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/AuthenticationRoutingModule.html" data-type="entity-link" >AuthenticationRoutingModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/HomeModule.html" data-type="entity-link" >HomeModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-HomeModule-a326e0b1b9839dfd3b666f904f75ac9e3e9a2cad8e95c0002bb4dd0caac8ec7dfdd5dc5b24c1fd262cb2636a555b6e487ed97f3783af15649e96c03c2f2a2076"' : 'data-bs-target="#xs-components-links-module-HomeModule-a326e0b1b9839dfd3b666f904f75ac9e3e9a2cad8e95c0002bb4dd0caac8ec7dfdd5dc5b24c1fd262cb2636a555b6e487ed97f3783af15649e96c03c2f2a2076"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-HomeModule-a326e0b1b9839dfd3b666f904f75ac9e3e9a2cad8e95c0002bb4dd0caac8ec7dfdd5dc5b24c1fd262cb2636a555b6e487ed97f3783af15649e96c03c2f2a2076"' :
                                            'id="xs-components-links-module-HomeModule-a326e0b1b9839dfd3b666f904f75ac9e3e9a2cad8e95c0002bb4dd0caac8ec7dfdd5dc5b24c1fd262cb2636a555b6e487ed97f3783af15649e96c03c2f2a2076"' }>
                                            <li class="link">
                                                <a href="components/AboutUsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AboutUsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/HomePageComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >HomePageComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PrivacyPolicyComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PrivacyPolicyComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TermsAndConditionsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TermsAndConditionsComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/HomeRoutingModule.html" data-type="entity-link" >HomeRoutingModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/ProfileModule.html" data-type="entity-link" >ProfileModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-ProfileModule-dd345c81f70fac89be26ff22748f23dd2ad438486f3f5f59ad9e64308d7cfe5ddda91e7c8df58c9027186f4eb13fd81410903b8bafb934d7792d01f970986248"' : 'data-bs-target="#xs-components-links-module-ProfileModule-dd345c81f70fac89be26ff22748f23dd2ad438486f3f5f59ad9e64308d7cfe5ddda91e7c8df58c9027186f4eb13fd81410903b8bafb934d7792d01f970986248"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-ProfileModule-dd345c81f70fac89be26ff22748f23dd2ad438486f3f5f59ad9e64308d7cfe5ddda91e7c8df58c9027186f4eb13fd81410903b8bafb934d7792d01f970986248"' :
                                            'id="xs-components-links-module-ProfileModule-dd345c81f70fac89be26ff22748f23dd2ad438486f3f5f59ad9e64308d7cfe5ddda91e7c8df58c9027186f4eb13fd81410903b8bafb934d7792d01f970986248"' }>
                                            <li class="link">
                                                <a href="components/EditPerfilComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EditPerfilComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PerfilPacienteComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PerfilPacienteComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PrivateProfileProfessionalComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PrivateProfileProfessionalComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PublicProfileProfessionalComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PublicProfileProfessionalComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/ProfileRoutingModule.html" data-type="entity-link" >ProfileRoutingModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/ServicesModule.html" data-type="entity-link" >ServicesModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-ServicesModule-dae45e2d934a2259a827939e617694ad001d269eb06ea2134a9c3a8920e6d109ee059751bd7e9c944ea290d4ae8cf85861b31c74f4b4c3d4f08c3fe52df9973b"' : 'data-bs-target="#xs-components-links-module-ServicesModule-dae45e2d934a2259a827939e617694ad001d269eb06ea2134a9c3a8920e6d109ee059751bd7e9c944ea290d4ae8cf85861b31c74f4b4c3d4f08c3fe52df9973b"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-ServicesModule-dae45e2d934a2259a827939e617694ad001d269eb06ea2134a9c3a8920e6d109ee059751bd7e9c944ea290d4ae8cf85861b31c74f4b4c3d4f08c3fe52df9973b"' :
                                            'id="xs-components-links-module-ServicesModule-dae45e2d934a2259a827939e617694ad001d269eb06ea2134a9c3a8920e6d109ee059751bd7e9c944ea290d4ae8cf85861b31c74f4b4c3d4f08c3fe52df9973b"' }>
                                            <li class="link">
                                                <a href="components/MapaComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MapaComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MarcacoesComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MarcacoesComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MarcarConsultaComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MarcarConsultaComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PaymentFailureComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PaymentFailureComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PaymentSuccessComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PaymentSuccessComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/ServicesRoutingModule.html" data-type="entity-link" >ServicesRoutingModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/SharedModule.html" data-type="entity-link" >SharedModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-SharedModule-4e724e39957b888d1e6c696201408326114a554a7c4c872602412d3cba84a81847c8bf1ed96c5561aa24f20cafcfcf592188432e84d41ddba3e56f0ab4bd24f4"' : 'data-bs-target="#xs-components-links-module-SharedModule-4e724e39957b888d1e6c696201408326114a554a7c4c872602412d3cba84a81847c8bf1ed96c5561aa24f20cafcfcf592188432e84d41ddba3e56f0ab4bd24f4"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-SharedModule-4e724e39957b888d1e6c696201408326114a554a7c4c872602412d3cba84a81847c8bf1ed96c5561aa24f20cafcfcf592188432e84d41ddba3e56f0ab4bd24f4"' :
                                            'id="xs-components-links-module-SharedModule-4e724e39957b888d1e6c696201408326114a554a7c4c872602412d3cba84a81847c8bf1ed96c5561aa24f20cafcfcf592188432e84d41ddba3e56f0ab4bd24f4"' }>
                                            <li class="link">
                                                <a href="components/LoadingSpinnerComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >LoadingSpinnerComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/NotFoundComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >NotFoundComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PopUpSuccessComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PopUpSuccessComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ValidationMessagesComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ValidationMessagesComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                </ul>
                </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#components-links"' :
                            'data-bs-target="#xs-components-links"' }>
                            <span class="icon ion-md-cog"></span>
                            <span>Components</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="components-links"' : 'id="xs-components-links"' }>
                            <li class="link">
                                <a href="components/CalendarioComponent.html" data-type="entity-link" >CalendarioComponent</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#classes-links"' :
                            'data-bs-target="#xs-classes-links"' }>
                            <span class="icon ion-ios-paper"></span>
                            <span>Classes</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                            <li class="link">
                                <a href="classes/Appointment.html" data-type="entity-link" >Appointment</a>
                            </li>
                            <li class="link">
                                <a href="classes/Availability.html" data-type="entity-link" >Availability</a>
                            </li>
                            <li class="link">
                                <a href="classes/AvailableSlot.html" data-type="entity-link" >AvailableSlot</a>
                            </li>
                            <li class="link">
                                <a href="classes/LoginWithGoogle.html" data-type="entity-link" >LoginWithGoogle</a>
                            </li>
                            <li class="link">
                                <a href="classes/RegisterWithGoogle.html" data-type="entity-link" >RegisterWithGoogle</a>
                            </li>
                            <li class="link">
                                <a href="classes/Relative.html" data-type="entity-link" >Relative</a>
                            </li>
                            <li class="link">
                                <a href="classes/UserProfile.html" data-type="entity-link" >UserProfile</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#injectables-links"' :
                                'data-bs-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/AgendaService.html" data-type="entity-link" >AgendaService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AppointmentService.html" data-type="entity-link" >AppointmentService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AuthenticationService.html" data-type="entity-link" >AuthenticationService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/HomeService.html" data-type="entity-link" >HomeService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ProfileService.html" data-type="entity-link" >ProfileService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ServicesService.html" data-type="entity-link" >ServicesService</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#interfaces-links"' :
                            'data-bs-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/AddReview.html" data-type="entity-link" >AddReview</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Bounds.html" data-type="entity-link" >Bounds</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Certificate.html" data-type="entity-link" >Certificate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ConfirmEmail.html" data-type="entity-link" >ConfirmEmail</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Description.html" data-type="entity-link" >Description</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EditarPerfil.html" data-type="entity-link" >EditarPerfil</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EmailModel.html" data-type="entity-link" >EmailModel</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Login.html" data-type="entity-link" >Login</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MakeAppointment.html" data-type="entity-link" >MakeAppointment</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Professional.html" data-type="entity-link" >Professional</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProfessionalType.html" data-type="entity-link" >ProfessionalType</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Register.html" data-type="entity-link" >Register</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ResetPassword.html" data-type="entity-link" >ResetPassword</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Review.html" data-type="entity-link" >Review</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Service.html" data-type="entity-link" >Service</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Service-1.html" data-type="entity-link" >Service</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Session.html" data-type="entity-link" >Session</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Specialty.html" data-type="entity-link" >Specialty</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UpdatePassword.html" data-type="entity-link" >UpdatePassword</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UpdatePicture.html" data-type="entity-link" >UpdatePicture</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/User.html" data-type="entity-link" >User</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#miscellaneous-links"'
                            : 'data-bs-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <a data-type="chapter-link" href="routes.html"><span class="icon ion-ios-git-branch"></span>Routes</a>
                        </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank" rel="noopener noreferrer">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});