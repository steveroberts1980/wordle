import { Component, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http'

// Need to test the following
// bl(o)ck
// m(o)p[e]y
// [o]ff[e]r
// [o]a[s][e]s
// onset <- word

export class Letter {
  letter: string = '';
  state: number = 0;
  background: string = 'gray';
  id: number = -1;

  constructor(id: number) {
    this.id = id;
  }

  getBackground(): string {
    switch (this.state) {
      case 0:
        return "gray";
      case 1:
        return "yellow";
      case 2:
        return "green";
    }

    return "gray";
  }

  updateState() {
    this.state = (this.state + 1) % 3;
    this.background = this.getBackground();
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'wordle';

  displayedColumns: string[] = ["0", "1", "2", "3", "4"];

  wordleData: Letter[][];
  private wordList: string[];
  possibleMatches: string[];

  constructor(private http: HttpClient) {
    this.wordleData = [];
    this.wordList = [];
    this.possibleMatches = [];

    this.loadWordList();
    this.clear();
  }

  focusNext(id: number) {
    document.getElementById((id+1).toString())?.focus();
  }

  loadWordList() {
    console.log('loading word list');
    this.http.get('assets/wordle.txt', {responseType: 'text'}).subscribe(data => {
      const list = data.split('\n');

      list.forEach(w => {
        this.wordList.push(w);
      });
    });
  }

  findWords() {
    this.possibleMatches = [];
    var filteredList: string[] = [];

    // Load the initial list
    this.wordList.forEach(element => {
      this.possibleMatches.push(element);
    });

    var badLetters: string = '';
    var goodLetters: string = '';
    var knownPositionLetters: string = '*****';

    for (var i: number = 0; i < 6; i++) { // Run through list of words
      
      for (var j: number = 0; j < 5; j++) { // Now through the list of letters for the word
        const w: Letter = this.wordleData[i][j];

        var okLetters: string ='';
        for (var k: number =0; k < 5; k++) {
          if (this.wordleData[i][k].state > 0) {
            okLetters += w.letter;
          }
        }

        if (w.letter != '') {
          w.letter = w.letter.toLowerCase();

          this.possibleMatches.forEach(word => {
              var isPossibleMatch: boolean = true;

              // Don't remove the word if the letter is an ok letter but there is more than one 
              // instance of the letter
              if (w.state == 0) { 
                if (word.indexOf(w.letter) > -1 && okLetters.indexOf(w.letter) == -1) {
                  isPossibleMatch = false;
                }
              } else if (w.state == 1) { // Right letter, wrong place.
                if (goodLetters.indexOf(w.letter) == -1) {
                  goodLetters += w.letter;
                }

                if (word.indexOf(w.letter) == j || word.indexOf(w.letter) == -1) {
                  isPossibleMatch = false;
                }
              } else {
                // Right letter, right place.
                if (goodLetters.indexOf(w.letter) == -1) {
                  goodLetters += w.letter;
                }

                if (word.indexOf(w.letter) != j) {
                  isPossibleMatch = false;
                }
              }

              if (isPossibleMatch)
                filteredList.push(word);
          });

            this.possibleMatches = [];
            filteredList.forEach(word => {
              this.possibleMatches.push(word);
            })
            filteredList = [];
        }
      }
    }
  }

  clear() {
    this.wordleData = [];
    this.possibleMatches = [];

    for (var i: number = 0; i < 6; i++) {
      this.wordleData[i] = [];
      for (var j: number = 0; j < 5; j++) {
        this.wordleData[i][j] = new Letter(i*5+j);
      }
    }
  }
}
