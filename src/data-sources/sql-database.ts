import { SQLDataSource } from './sql-datasource.js'

const MINUTE = 60;

export class MyDatabase extends SQLDataSource {

  getCalendar(idCampionato: string) {
    return this.knex('calendario')
      .join('gare', 'gare.pk', '=', 'calendario.fk_gara')
      .where('calendario.fk_campionato', idCampionato)
      .select(this.knex.ref('calendario.pk').as('id'), 
              this.knex.ref('calendario.ordine_gp').as('ordine_gp'), 
              this.knex.ref('gare.nome').as('nome_gara'),
              this.knex.ref('calendario.data').as('data'),
              this.knex.ref('calendario.ora_limite').as('ora_limite_scommesse'));
    
      //.cache(MINUTE);
  }

  getConfiguration(id: string) {
    return this.knex(this.knex.ref('configurazione').as('c'))
      .where('c.pk', id)
      .first(this.knex.ref('c.pk').as('id'),
              this.knex.ref('c.fk_campionato').as('id_campionato'),
              this.knex.ref('c.session_timeout').as('session_timeout'),
              this.knex.ref('c.bets_limit_gara').as('bets_limit_gara'),
              this.knex.ref('c.bets_limit_gara_sprint').as('bets_limit_gara_sprint'),
              this.knex.ref('c.bets_limit_pilota').as('bets_limit_pilota'),
              this.knex.ref('c.bets_limit_points').as('bets_limit_points'),
              this.knex.ref('c.bets_limit_sprint_pilota').as('bets_limit_sprint_pilota'),
              this.knex.ref('c.bets_limit_sprintrace_points').as('bets_limit_sprintrace_points'),
              this.knex.ref('c.formation_limit_pilota').as('formation_limit_pilota'));
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

  getTeam(username: string, idCampionato: string) {
    return this.knex(this.knex.ref('teams').as("t"))
              .join(this.knex.ref('piloti').as('p1'), 't.pilota_ufficiale', '=', 'p1.pk')
              .join(this.knex.ref('piloti').as('p2'), 't.pilota_riserva', '=', 'p2.pk')
              .join(this.knex.ref('piloti').as('p3'), 't.capotecnico', '=', 'p3.pk')
              .where({'fk_campionato': idCampionato, 'iduser': username})
              .first(this.knex.ref('t.pk').as('id'),
                      this.knex.ref('t.fk_campionato').as('id_campionato'),
                      this.knex.ref('t.iduser').as('username'),
                      this.knex.ref('t.nome').as('nome'),
                      this.knex.ref('t.teamimage').as('teamimage'),
                      this.knex.raw(`CONCAT(p1.nome, ' ', p1.cognome) as "pilota_fascia1"`),
                      this.knex.raw(`CONCAT(p2.nome, ' ', p2.cognome) as "pilota_fascia2"`),
                      this.knex.raw(`CONCAT(p3.nome, ' ', p3.cognome) as "pilota_fascia3"`),
                      );
  }

  getTeams(idCampionato: string) {
    return this.knex(this.knex.ref('teams').as("t"))
              .join(this.knex.ref('piloti').as('p1'), 't.pilota_ufficiale', '=', 'p1.pk')
              .join(this.knex.ref('piloti').as('p2'), 't.pilota_riserva', '=', 'p2.pk')
              .join(this.knex.ref('piloti').as('p3'), 't.capotecnico', '=', 'p3.pk')
              .where('fk_campionato', idCampionato)
              .select(this.knex.ref('t.pk').as('id'),
                      this.knex.ref('t.fk_campionato').as('id_campionato'),
                      this.knex.ref('t.iduser').as('username'),
                      this.knex.ref('t.nome').as('nome'),
                      this.knex.ref('t.teamimage').as('teamimage'),
                      this.knex.raw(`CONCAT(p1.nome, ' ', p1.cognome) as "pilota_fascia1"`),
                      this.knex.raw(`CONCAT(p2.nome, ' ', p2.cognome) as "pilota_fascia2"`),
                      this.knex.raw(`CONCAT(p3.nome, ' ', p3.cognome) as "pilota_fascia3"`),
                      );
  }

  getClassifica(idCampionato: string, username: string = null) {
    let query = this.knex(this.knex.ref('classifica').as("c"))
              .where('c.fk_campionato', idCampionato)
              .join(this.knex.ref('utenti').as('u'), 'u.iduser', '=', 'c.iduser')
              .select(this.knex.ref('c.pk').as('id'),
                    this.knex.ref('c.iduser').as('username'),
                    this.knex.raw(`CONCAT(u.nome, ' ', u.cognome) as "nomeCognome"`),
                    this.knex.ref('c.posizione').as('posizione'),
                    this.knex.ref('c.punteggio').as('punteggio')
              );
    if(!!username) query.where('c.iduser', username);

    return query;
  }
}