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

function templateParser() {
  const Parser = require("expr-eval").Parser;
  const parser = new Parser();

  const ifRegex = /<if \([^)]*\)>.*?<else>?.*?<endif>/;
  const ifStack = [];
  const elseStack = [];

  const string = `
    Hi <if (0 == 0)>[1 > 2]<else>[2 > 1]<endif>This is your ticket!
    Ahihi!<if (0 == 0)>[2/3]<else>[3/4]<endif>Ahhi
  `;

  function hasCondition() {
    return ifStack.length;
  }

  function hasElse() {
    return elseStack.length;
  }

  // const ifRegex = /<if \([^)]*\)>[A-Za-z0-9]+<endif>[A-Za-z0-9]+/;
  const SYNTAX = {
    // key
    OPEN_KEY: "<",
    CLOSE_KEY: ">",
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

  function isNormalWord() {
    return !isKeyword && !isEndKey && !isBeginKey;
  }

  let temp = "";
  let keyword = "";
  let isKeyword = false;
  let isOpenKey = false;
  let isCloseKey = false;

  let isConditionalStatement = false;
  let conditionalStatement = ""; // (0 > 0)
  let ifResult = ""; // [1 / 2]
  let isIfResult = false;
  let elseResult = ""; // [2 / 1]
  let isElseResult = false;
  let isElse = false;
  let isIf = false;
  let conditionResult; // boolean
  let isIfElseStatement = false; // indicate token is between <if> and <endif>
  let finalResult = "";

  let prev = "";

  for (const [i, c] of string.split("").entries()) {
    function update() {
      if (isConditionalStatement) {
        conditionalStatement += c;
      }
      if (isIfResult) {
        ifResult += c;
      }

      if (isElseResult) {
        elseResult += c;
      }

      if (isKeyword) {
        keyword += c;
      }
    }
    console.log("c: ", c);

    switch (c) {
      case SYNTAX.OPEN_KEY:
        if (isOpenKey) {
          // Check consecutive "<"
          finalResult += c;
          keyword = "";
        } else if (!isElseResult || !isIfResult) {
          isOpenKey = true;
          isKeyword = true;
          if (keyword.length > maxKeywordLength) {
            isKeyword = false;
            keyword = "";
          }
        }
        update();
        break;

      case SYNTAX.CLOSE_KEY:
        isOpenKey = false;
        isCloseKey = true;

        if (prev === SYNTAX.CLOSE_PARENTHESE) {
          isConditionalStatement = false;
          isIf = false;
          update();
          isIfResult = true;
        } else {
          update();
        }

        isKeyword = false;
        break;

      case SYNTAX.OPEN_PARENTHESE:
        isConditionalStatement = true;
        update();
        break;

      case SYNTAX.CLOSE_PARENTHESE:
        update();
        break;

      case SYNTAX.SPACE:
        isKeyword = false;
        keyword = "";
        update();
        break;

      default:
        update();
        break;
    }

    console.log("keyword: ", keyword);

    switch (keyword) {
      case SYNTAX.IF:
        ifStack.push(i);
        isIf = true;
        isIfElseStatement = true;
        isKeyword = false;
        break;

      case SYNTAX.END_IF:
        if (hasCondition()) {
          ifStack.pop();

          isIf = false;
          isIfElseStatement = false;
          isElse = false;

          if (hasElse()) {
            elseStack.pop();
            ifResult = ifResult.substring(
              0,
              ifResult.length - SYNTAX.ELSE.length
            );

            elseResult = elseResult.substring(
              0,
              elseResult.length - SYNTAX.END_IF.length
            );
          } else {
            ifResult = ifResult.substring(
              0,
              ifResult.length - SYNTAX.END_IF.length
            );
          }

          const comparisionExpr = parser.parse(conditionalStatement);

          conditionResult = comparisionExpr.evaluate() ? ifResult : elseResult;
          finalResult += conditionResult;

          isIfResult = false;
          isElseResult = false;

          conditionalStatement = "";
          ifResult = "";
          elseResult = "";
        } else {
          throw new Error("SYNTAX_ERROR");
        }
        isKeyword = false;
        keyword = "";
        break;

      case SYNTAX.ELSE:
        elseStack.push(i);
        isIfResult = false;
        isElse = true;
        update();
        isElseResult = true;
        keyword = "";
        isKeyword = false;
        break;

      default:
        if (!isIfElseStatement && !isKeyword) {
          finalResult += c;
        }
        break;
    }

    prev = c;

    console.log("isKeyword: ", isKeyword);
    console.log("ifStack: ", ifStack);
    console.log("isIfElseStatement: ", isIfElseStatement);
    console.log("isIf: ", isIf);
    console.log("isConditionalStatement: ", isConditionalStatement);
    console.log("conditionalStatement: ", conditionalStatement);
    console.log("ifResult: ", ifResult);
    console.log("isElse: ", isElse);
    console.log("elseResult: ", elseResult);
    console.log("finalResult: ", finalResult);
    console.log("string: ", string);
    console.log("-------");
  }
}

templateParser();

// eval("(0 > 0");

// const reg = /./;
// const res = reg.test("(ticket.ticket_count > 0)");
// console.log("res: ", res);
