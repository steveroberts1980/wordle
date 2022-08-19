import { Component, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { flatMap } from 'rxjs';

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
    var badLetters: string = '';
    var goodLetters: string = '';
    var knownPositionLetters: string = '*****';

    for (var i: number = 0; i < 6; i++) {
      for (var j: number = 0; j < 5; j++) {
        const w: Letter = this.wordleData[i][j];

        if (w.letter != '') {
          w.letter = w.letter.toLowerCase();

          // w.state == 0 is NOT IN THE WORD
          if (w.state == 0) {
            badLetters += w.letter;
          } else if (w.state == 1) {
            // Right letter, wrong place.
            goodLetters += w.letter;
          } else {
            // Right letter, right place.
            goodLetters += w.letter;

            var n = "";

            for (var k: number = 0; k < 5; k++) {
              if (k==j) {
                n+= w.letter;
              } else {
                n += knownPositionLetters[k];
              }
            }

            knownPositionLetters = n;
          }
        }
      }
    }

    for (var i: number = 0; i < goodLetters.length; i++) {
      badLetters = badLetters.replace(goodLetters[i], '');
    }

    for (var i: number = 0; i < 5; i++) {
      badLetters = badLetters.replace(knownPositionLetters[i], '');
    }

    this.wordList.forEach(w => {
      var isPossibleMatch: boolean = true;

      // First remove any words that contain invalid letters
      for (var i: number = 0; i < badLetters.length; i++) {
        if (w.indexOf(badLetters[i]) > -1) {
          isPossibleMatch = false;
          break;
        }
      }

      // Now remove any words that don't contain a valid letter
      for (var i: number = 0; i < goodLetters.length; i++) {
        if (w.indexOf(goodLetters[i]) == -1) {
          isPossibleMatch = false;
          break;
        }
      }

      // Now remove any words that don't contain a valid letter in the right position
      for (var i: number = 0; i < knownPositionLetters.length; i++) {
        if (knownPositionLetters[i] != '*') {
          if (w.charAt(i) != knownPositionLetters[i]) {
            isPossibleMatch = false;

            break;
          }
        }
      }

      if (isPossibleMatch) {
        this.possibleMatches.push(w);
      }
    });
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

  tabnext(e: any) {

  }

}
