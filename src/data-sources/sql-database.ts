import { SQLDataSource } from './sql-datasource.js'

const MINUTE = 60;

export class MyDatabase extends SQLDataSource {

  getCalendar(idCampionato: string) {
    return this.knex(this.knex.ref('calendario').as("c"))
      .join(this.knex.ref('gare').as('g'), 'g.pk', '=', 'c.fk_gara')
      .where('c.fk_campionato', idCampionato)
      .select(this.knex.ref('c.pk').as('id'), 
              this.knex.ref('c.ordine_gp').as('ordine_gp'), 
              this.knex.ref('g.nome').as('nome_gara'),
              this.knex.ref('g.luogo').as('luogo_gara'), 
              this.knex.ref('c.data').as('data'),
              this.knex.ref('c.ora_limite').as('ora_limite_scommesse'));
    
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

  //Prossima gara
  // SELECT gare.pk as pkgara, gare.nome as nomegara, calendario.data as data, calendario.ora_limite as ora_limite 
  //                 FROM gare 
  //                 	JOIN calendario ON gare.pk = calendario.fk_gara 
  //                 WHERE calendario.fk_campionato='$id_campionato' AND 
  //                 	(CURDATE() < DATE(data) OR (CURDATE() = DATE(data) AND CURRENT_TIME() < ora_limite ) )
  getNextRace(idCampionato: string) {
    let query = this.knex(this.knex.ref('calendario').as("c"))
              .where('c.fk_campionato', idCampionato)
              .andWhere(this.knex.raw(`CURDATE() < DATE_SUB(DATE(data), INTERVAL 2 DAY)`))
              .join(this.knex.ref('gare').as('g'), 'g.pk', '=', 'c.fk_gara')
              .first(this.knex.ref('c.pk').as('id'),
                    this.knex.ref('c.ordine_gp').as('ordine_gp'),
                    this.knex.ref('g.nome').as('nome_gara'),
                    this.knex.ref('g.luogo').as('luogo_gara'), 
                    this.knex.ref('c.data').as('data'),
                    this.knex.ref('c.ora_limite').as('ora_limite_scommesse'));

    return query;
  }

  getCurrentRace(idCampionato: string) {
    let query = this.knex(this.knex.ref('calendario').as("c"))
              .where('c.fk_campionato', idCampionato)
              .andWhere(this.knex.raw(`CURDATE() = DATE_SUB(DATE(data), INTERVAL 2 DAY) OR CURDATE() = DATE_SUB(DATE(data), INTERVAL 1 DAY) OR CURDATE() = DATE(data)`))
              .join(this.knex.ref('gare').as('g'), 'g.pk', '=', 'c.fk_gara')
              .first(this.knex.ref('c.pk').as('id'),
                    this.knex.ref('c.ordine_gp').as('ordine_gp'),
                    this.knex.ref('g.nome').as('nome_gara'),
                    this.knex.ref('g.luogo').as('luogo_gara'), 
                    this.knex.ref('c.data').as('data'),
                    this.knex.ref('c.ora_limite').as('ora_limite_scommesse'));

    return query;
  }
}

// gare passate
// SELECT g.pk as pkgara, g.nome as nomegara, c.ordine_gp as ordinegp, c.data, c.ora_limite as ora_limite 
// 					FROM gare as g 
//                          JOIN calendario as c ON g.pk = c.fk_gara 
// 					WHERE (c.fk_campionato = '%s') 
//                     	   AND ((CURDATE() > DATE(c.data)) OR (CURDATE() = DATE(c.data) AND CURRENT_TIME() > ora_limite))

//Scommesse
// SELECT u.nome as nome_utente, u.cognome as cognome_utente, s.data_ora_ins as timestamp, s.pt as punteggio, s.posizione as posizione, 
//       									 p.nome as nome_pilota, p.cognome as cognome_pilota, s.esito as esito
//                                   FROM scommesse as s
//                                   	JOIN gare ON gare.pk = s.fk_gara 
//                                     JOIN piloti as p ON p.pk = s.fk_pilota 
//                                     JOIN utenti as u ON u.iduser = s.idutente
//                                   WHERE gare.pk = '%s' AND s.fk_campionato = '%s'
//                                   ORDER BY s.idutente