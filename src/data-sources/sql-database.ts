import { SQLDataSource } from './sql-datasource.js'

const MINUTE = 60;

export class MyDatabase extends SQLDataSource {

  getCalendar(id_campionato: string) {
    return this.knex('calendario')
      .join('gare', 'gare.pk', '=', 'calendario.fk_gara')
      .where('calendario.fk_campionato', id_campionato)
      .select(this.knex.ref('calendario.pk').as('id'), 
              this.knex.ref('calendario.ordine_gp').as('ordine_gp'), 
              this.knex.ref('gare.nome').as('nome_gara'),
              this.knex.ref('calendario.data').as('data'),
              this.knex.ref('calendario.ora_limite').as('ora_limite_scommesse'));
    
      //.cache(MINUTE);
  }

  getConfiguration(id: string) {
    return this.knex('configurazione')
      .where('configurazione.pk', id)
      .first(this.knex.ref('configurazione.pk').as('id'),
              this.knex.ref('configurazione.fk_campionato').as('id_campionato'),
              this.knex.ref('configurazione.session_timeout').as('session_timeout'),
              this.knex.ref('configurazione.bets_limit_gara').as('bets_limit_gara'),
              this.knex.ref('configurazione.bets_limit_gara_sprint').as('bets_limit_gara_sprint'),
              this.knex.ref('configurazione.bets_limit_pilota').as('bets_limit_pilota'),
              this.knex.ref('configurazione.bets_limit_points').as('bets_limit_points'),
              this.knex.ref('configurazione.bets_limit_sprint_pilota').as('bets_limit_sprint_pilota'),
              this.knex.ref('configurazione.bets_limit_sprintrace_points').as('bets_limit_sprintrace_points'),
              this.knex.ref('configurazione.formation_limit_pilota').as('formation_limit_pilota'));
  }

  getUsers() {
    return this.knex('utenti').select('*');
  }

  getUser(username: string, password: string) {
    return this.knex('utenti')
      .where({
        iduser: username,
        pwd:  password
      })
      .first('*');
  }
}