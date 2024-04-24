import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment.development';
import { User } from '../shared/models/authentication/user';
import { UserProfile } from '../shared/models/profile/userProfile';
import { UpdatePassword } from '../shared/models/profile/updatePassword';
import { Relative } from '../shared/models/profile/relative';
import { Observable, catchError } from 'rxjs';
import { Professional } from '../shared/models/profile/professional';
import { Service } from '../shared/models/profile/service';
import { Specialty } from '../shared/models/profile/specialty';
import { Description } from '../shared/models/profile/description';
import { Review } from '../shared/models/profile/review';
import { jwtDecode } from 'jwt-decode';
import { Certificate } from '../shared/models/profile/certificate';
import { AddReview } from '../shared/models/profile/addReview';
import { UpdatePicture } from '../shared/models/profile/updatePicture';
import { Location } from '../shared/models/profile/location';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  constructor(private http: HttpClient, private router: Router) { }

  /**
   * Obtém o JWT do utilizador armazenado localmente.
   * @returns O token JWT do utilizador.
   */
  getJWT() {
    const key = localStorage.getItem(environment.userKey);
    if (key) {
      const user = JSON.parse(key) as User;
      return user.jwt;
    } else {
      return 'No JWT';
    }
  }

  /**
  * Decodifica o token JWT para obter informações.
  * @returns As informações decodificadas do token JWT.
  */
  getDecodedToken() {
    const jwt = this.getJWT();
    if (jwt != null) {
      const decodedToken: any = jwtDecode(jwt);
      return decodedToken;
    }
  }

  /**
   * Obtém os cabeçalhos para a requisição HTTP, incluindo o token JWT.
   * @returns Os cabeçalhos HTTP com o token de autenticação.
   */
  getHeaders() {
    const jwt = this.getJWT();

    // Set up the headers with the authentication token
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwt}`
    });

    return headers;
  }

  /**
  * Obtém os dados do utilizador.
  * @returns Um Observable contendo os dados do utilizador.
  */
  getUserData(): Observable<UserProfile> {
    const headers = this.getHeaders();
    return this.http.get<UserProfile>(`${environment.appUrl}/api/profile/get-user`, { headers });
  }

  /**
  * Obtém os dados do utilizador pelo ID.
  * @param id O ID do utilizador.
  * @returns Um Observable contendo os dados do utilizador.
  */
  getUserById(id : string): Observable<UserProfile> {
    const headers = this.getHeaders();
    return this.http.get<UserProfile>(`${environment.appUrl}/api/profile/get-user/${id}`, { headers });
  }

  /**
  * Atualiza os dados do utilizador.
  * @param model Os novos dados do utilizador.
  * @returns Um Observable contendo a resposta da requisição.
  */
  updateUserData(model: UserProfile) {
    const headers = this.getHeaders();
    return this.http.put(`${environment.appUrl}/api/profile/update-user-info`, model, { headers });
  }

 /**
 * Retorna as informações profissionais do utilizador atual.
 * @returns Um Observable contendo as informações profissionais.
 */
  getProfessionalInfo(): Observable<Professional> {
    const headers = this.getHeaders();
    return this.http.get<Professional>(`${environment.appUrl}/api/profile/get-professional-info`, { headers });
  }

  /**
 * Retorna as informações profissionais de um utilizador pelo ID.
 * @param id O ID do utilizador.
 * @returns Um Observable contendo as informações profissionais.
 */
  getProfessionalInfoById(id: string): Observable<Professional> {
    const headers = this.getHeaders();
    return this.http.get<Professional>(`${environment.appUrl}/api/profile/get-professional-info/${id}`, { headers });
  }

  /**
 * Obtém a lista de especialidades disponíveis.
 * @returns Um Observable contendo a lista de especialidades.
 */
  getServices(): Observable<Specialty[]> {
    const headers = this.getHeaders();
    return this.http.get<Specialty[]>(`${environment.appUrl}/api/profile/get-specialties`, { headers });
  }

  /**
 * Obtém a lista de parentes do utilizador.
 * @returns Um Observable contendo a lista de parentes.
 */
  getRelatives(): Observable<Relative[]> {
    const headers = this.getHeaders();
    return this.http.get<Relative[]>(`${environment.appUrl}/api/profile/get-relatives`, { headers });
  }

  /**
 * Atualiza a senha do utilizador.
 * @param model O modelo contendo as informações de atualização de senha.
 * @returns Um Observable contendo a resposta da requisição.
 */
  updatePassword(model: UpdatePassword) {
    const headers = this.getHeaders();
    return this.http.put(`${environment.appUrl}/api/profile/update-password`, model, { headers });
  }

  /**
 * Atualiza a foto de perfil do utilizador.
 * @param pictureFile O arquivo de imagem da nova foto de perfil.
 * @returns Um Observable contendo a resposta da requisição.
 */
  updatePicture(pictureFile: File): Observable<any> {
    const formData = new FormData();
    formData.append('imageFile', pictureFile);
    
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + this.getJWT() // replace this.getToken() with your token retrieval logic
    });

    return this.http.put(`${environment.appUrl}/api/profile/update-picture`, formData, { headers });
  }

  /**
 * Obtém a foto de perfil do utilizador.
 * @returns Um Observable contendo a imagem da foto de perfil.
 */
  getProfilePicture(): Observable<Blob> {
  const headers = new HttpHeaders({
    'Authorization': 'Bearer ' + this.getJWT(),
    'Content-Type': 'application/json',
  });

    return this.http.get(`${environment.appUrl}/api/profile/get-profile-picture`, {
    headers: headers,
    responseType: 'blob'
  }).pipe(
    catchError(error => {
      throw ('Error downloading image: ' + error);
    })
  );
}
  /**
 * Atualiza o endereço do utilizador.
 * @param location As informações do novo endereço.
 * @returns Um Observable contendo a resposta da requisição.
 */
  updateAddress(location: Location) {
    const headers = this.getHeaders();
    return this.http.patch(`${environment.appUrl}/api/profile/update-address`, location, { headers });
  }

  /**
 * Deleta um parente do utilizador pelo ID.
 * @param relativeId O ID do parente a ser deletado.
 * @returns Um Observable contendo a resposta da requisição.
 */
  deleteRelative(relativeId: number): Observable<Relative> {
    const headers = this.getHeaders();
    return this.http.delete<Relative>(`${environment.appUrl}/api/profile/delete-relative/${relativeId}`, { headers });
  }

  /**
 * Adiciona um novo parente para o utilizador.
 * @param relative As informações do novo parente.
 * @returns Um Observable contendo a resposta da requisição.
 */
  addRelative(relative: Relative): Observable<Relative> {
    const headers = this.getHeaders();
    return this.http.post<Relative>(`${environment.appUrl}/api/profile/add-relative`, relative, { headers });
  }

  /**
 * Adiciona uma nova especialidade para o utilizador.
 * @param service As informações da nova especialidade.
 * @returns Um Observable contendo a resposta da requisição.
 */
  addSpecialty(service: Service): Observable<Service> {
    const headers = this.getHeaders();
    return this.http.post<Service>(`${environment.appUrl}/api/profile/add-service`, service, { headers });
  }

  /**
 * Atualiza as informações de um parente do utilizador.
 * @param relative As novas informações do parente.
 * @returns Um Observable contendo a resposta da requisição.
 */
  updateRelative(relative: Relative): Observable<Relative> {
    const headers = this.getHeaders();
    return this.http.put<Relative>(`${environment.appUrl}/api/profile/update-relative/${relative.id}`, relative, { headers });
  }

  /**
 * Adiciona um relatório para um parente do utilizador.
 * @param relative As informações do parente e do relatório.
 * @returns Um Observable contendo a resposta da requisição.
 */
  addReport(relative: Relative): Observable<Relative> {
    const headers = this.getHeaders();
    return this.http.post<Relative>(`${environment.appUrl}/api/profile/add-relative`, relative, { headers });
  }

  /**
 * Atualiza uma especialidade do utilizador.
 * @param service As informações atualizadas da especialidade.
 * @returns Um Observable contendo a resposta da requisição.
 */
  updateSpecialty(service: Service): Observable<Service> {
    const headers = this.getHeaders();
    return this.http.put<Service>(`${environment.appUrl}/api/profile/update-service`, service, { headers });
  }

  /**
 * Deleta uma especialidade do utilizador pelo ID.
 * @param serviceId O ID da especialidade a ser deletada.
 * @returns Um Observable contendo a resposta da requisição.
 */
  deleteSpecialty(serviceId: number): Observable<Service> {
    const headers = this.getHeaders();
    return this.http.delete<Service>(`${environment.appUrl}/api/profile/delete-service/${serviceId}`, { headers });
  }

  /**
 * Atualiza a descrição do perfil do utilizador.
 * @param description A nova descrição do perfil.
 * @returns Um Observable contendo a resposta da requisição.
 */
  updateDescription(description: Description): Observable<Description> {
    const headers = this.getHeaders();
    return this.http.patch<Description>(`${environment.appUrl}/api/profile/update-description`, description, { headers });
  }

  /**
 * Filtra as avaliações por serviço.
 * @param idService O ID do serviço para filtrar as avaliações.
 * @returns Um Observable contendo a lista de avaliações filtradas.
 */
  filterReviewsByService(idService: number): Observable<Review[]> {
    const headers = this.getHeaders();
    return this.http.get<Review[]>(`${environment.appUrl}/api/profile/filter-reviews-by-service/${idService}`, { headers });
  }

  /**
 * Filtra as avaliações por serviço e ID do profissional.
 * @param idSpecialty O ID da especialidade do serviço.
 * @param idProfessional O ID do profissional.
 * @returns Um Observable contendo a lista de avaliações filtradas.
 */
  filterReviewsByServiceById(idSpecialty: number, idProfessional: string): Observable<Review[]> {
    const headers = this.getHeaders();
    return this.http.get<Review[]>(`${environment.appUrl}/api/profile/filter-reviews-by-service/${idSpecialty}/${idProfessional}`, { headers });
  }

  /**
 * Adiciona uma avaliação para um serviço.
 * @param review As informações da avaliação.
 * @returns Um Observable contendo a resposta da requisição.
 */
  addReview(review: AddReview): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post<any>(`${environment.appUrl}/api/profile/add-review`, review, { headers });
  }

  /**
 * Faz o upload de um arquivo PDF.
 * @param pdfFile O arquivo PDF a ser enviado.
 * @returns Um Observable contendo a resposta da requisição.
 */
  uploadPdf(pdfFile: File): Observable<any> {

    const formData = new FormData();
    formData.append('pdfFile', pdfFile);

    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + this.getJWT() // replace this.getToken() with your token retrieval logic
    });

    return this.http.post(`${environment.appUrl}/api/profile/upload-pdf`, formData, { headers }).pipe(
      catchError(error => {
        throw 'Error uploading PDF: ' + error;
      })
    );
  }

  /**
 * Obtém a lista de certificados em PDF do utilizador.
 * @returns Um Observable contendo a lista de certificados em PDF.
 */
  getPdfs(): Observable<Certificate[]> {
    const headers = this.getHeaders();

    return this.http.get<Certificate[]>(`${environment.appUrl}/api/profile/get-pdfs`, { headers }).pipe(
      catchError(error => {
        throw 'Error getting PDFs: ' + error;
      })
    );
  }

  /**
 * Obtém a lista de certificados em PDF do utilizador pelo ID.
 * @param id O ID do utilizador.
 * @returns Um Observable contendo a lista de certificados em PDF.
 */
  getPdfsById(id : string): Observable<Certificate[]> {
    const headers = this.getHeaders();

    return this.http.get<Certificate[]>(`${environment.appUrl}/api/profile/get-pdfs/${id}`, { headers }).pipe(
      catchError(error => {
        throw 'Error getting PDFs: ' + error;
      })
    );
  }

  /**
 * Deleta um certificado PDF pelo ID.
 * @param certificateId O ID do certificado PDF a ser deletado.
 * @returns Um Observable contendo a resposta da requisição.
 */
  deletePdf(certificateId: number): Observable<any> {
    const headers = this.getHeaders();

    return this.http.delete(`${environment.appUrl}/api/profile/delete-pdf/${certificateId}`, { headers }).pipe(
      catchError(error => {
        throw 'Error deleting PDF: ' + error;
      })
    );
  }

  /**
 * Baixa um certificado PDF.
 * @param filePath O caminho do arquivo PDF.
 * @returns Um Observable contendo o arquivo PDF.
 */
  downloadPdf(filePath: string): Observable<Blob> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + this.getJWT(),
      'Content-Type': 'application/json',
    });

    return this.http.get(`${environment.appUrl}/api/profile/download-pdf?filePath=${filePath}`, {
      headers: headers,
      responseType: 'blob'
    }).pipe(
      catchError(error => {
        throw ('Error downloading PDF: ' + error);
      })
    );
  }
}
