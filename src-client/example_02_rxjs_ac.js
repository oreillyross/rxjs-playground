import $ from "jquery";
import Rx from "rxjs/Rx";

const $title = $("#title");
const $results = $("#results");

Rx.Observable.fromEvent($title, "keyup")
  .map(e => e.target.value)
  .distinctUntilChanged()
  .debounceTime(500)
  .switchMap(getItems)
  .subscribe(items => {
    $results.empty();
    $results.append(items.map(i => $('<li/>').text(i)));
  })


// test function to simulate an asynchronous request

function getItems(title) {
  console.log(`Querying ${title}`);
  return new Promise((resolve, reject) => {
    window.setTimeout(() => {
      resolve([title, "Item 2", `Another ${Math.random()}`]);
    }, 500 + (Math.random() * 2000));

  });
}
