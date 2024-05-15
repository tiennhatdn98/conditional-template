/*
parameter order 1 
parameter total 5 
${if ticket.ticket_count}[${ticket.ticket_order} / ${ticket.ticket_count}]${end if}Hello, this is your ticket number 
==> "[1 / 5]Hello, this is your ticket number" 
parameter order 0 or null 
parameter total 0 or null 
${if ticket.ticket_count}[${ticket.ticket_order} / ${ticket.ticket_count}]${end if}Hello, this is your ticket number 
==> "Hello, this is your ticket number"
*/
// -------------------------------
/* <if (ticket.ticket_count > 0)>
"[${ticket.ticket_order} / ${ticket.ticket_count}]"
<endif>
Hello, this is your ticket number 
*/

function execute() {
  const ifRegex = /<if \([^)]*\)>.*?<endif>/;
  const ifStack = [];

  const string =
    "Hi < <if (0 > 0)>[1 / 2]<else>[2 / 1]<endif>This is your ticket";

  function hasCondition() {
    return ifStack.length;
  }

  // const ifRegex = /<if \([^)]*\)>[A-Za-z0-9]+<endif>[A-Za-z0-9]+/;
  const SYNTAX = {
    // key
    BEGIN_KEY: "<",
    END_KEY: ">",
    IF: "<if",
    END_IF: "<endif>",
    ELSE: "<else>",
    OPEN_PARENTHESE: "(",
    CLOSE_PARENTHESE: ")",
    SPACE: " ",
  };

  const maxKeywordLength = Math.max(
    ...Object.values(SYNTAX).map((_) => _.length)
  );

  let temp = "";
  let keyword = "";
  let isKeyword;
  let isEndKey = false;
  let isBeginKey = false;

  let conditionalStatement = "";
  let ifResult = "";
  let elseResult = "";
  let condition; // boolean
  let isConditionalResult;

  let finalResult = "";

  for (const [i, c] of string.split("").entries()) {
    console.log("c: ", c);
    switch (c) {
      case SYNTAX.BEGIN_KEY:
        isKeyword = true;
        isBeginKey = true;
        keyword += c;
        if (conditionalStatement) {
          conditionalStatement += c;
        }
        if (keyword.length > maxKeywordLength) {
          isKeyword = false;
          isBeginKey = false;
        }
        break;

      case SYNTAX.END_KEY:
        if (!conditionalStatement) {
          isKeyword = false;
          isEndKey = true;
        } else {
          conditionalStatement += c;

          isConditionalResult = true;
        }
        break;

      case SYNTAX.OPEN_PARENTHESE:
        if (hasCondition()) {
          conditionalStatement += c;
        }
        break;

      case SYNTAX.CLOSE_PARENTHESE:
        console.log("Alos");
        if (hasCondition()) {
          conditionalStatement += c;
          // condition = eval(conditionalStatement);

          // if (condition) {
          //   ifResult = ifResult;
          // }

          conditionalStatement = "";
        }
        break;

      case SYNTAX.SPACE:
        keyword = "";

      default:
        if (keyword) {
          keyword += c;
        } else if (conditionalStatement) {
          conditionalStatement += c;
        } else if (isConditionalResult) {
          ifResult += c;
        }
        isEndKey = false;
        isBeginKey = false;
        break;
    }

    console.log("keyword: ", keyword);

    switch (keyword) {
      case SYNTAX.IF:
        isBeginKey = true;
        ifStack.push(i);
        keyword = "";
        break;

      case SYNTAX.END_IF:
        if (hasCondition()) {
          ifStack.pop();

          condition = eval(conditionalStatement);

          if (condition) {
            finalResult += ifResult;
          }
        } else {
          throw new Error("no <if> for <endif> at ", i);
        }
        break;

      case SYNTAX.ELSE:
        break;

      default:
        if (!isKeyword && !isEndKey && !isBeginKey) {
          finalResult += c;
        }
        break;
    }

    console.log("ifStack: ", ifStack);
    console.log("conditionalStatement: ", conditionalStatement);
    console.log("ifResult: ", ifResult);
    console.log("finalResult: ", finalResult);
    console.log("-------");
  }

  console.log(finalResult);
}

execute();

// eval("(0 > 0");

// const reg = /./;
// const res = reg.test("(ticket.ticket_count > 0)");
// console.log("res: ", res);
