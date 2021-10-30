import Layout from "./Layout";
import {useState, useEffect} from 'react';
import {Divider, Grid, Image, Message, Segment, Button} from "semantic-ui-react";
import quotes from "../utils/quotes";
import {START_DATE} from '../utils/constants';

/** @jsxImportSource @emotion/react */
import {css} from "@emotion/react";

const Code = ({text}) => {
    return (
        <code css={{
            backgroundColor: 'rgba(27,31,35,.05)',
            borderRadius: 3,
            fontSize: '95%',
            padding: '.2em .4em',
            marginLeft: 4,
            marginRight: 4,
        }}>
            {text}
        </code>
    )
}

const messageWrapperCss = css`
    .ui.message {
      background: transparent;
      border-radius: unset;
      box-shadow: none;
      padding-left: .8em;
    }
`;

// Inspired from https://css-tricks.com/snippets/css/simple-and-nice-blockquote-styling
const quoteCss = css`
  background: #f9f9f9;
  border-left: 10px solid #ccc;
  font-style: italic;
  line-height: 1.5em;
  margin: 1.5em 0;
  padding: 0.5em 10px;
  position: relative;
  quotes: "\\201C""\\201D""\\2018""\\2019";

  &:before {
    color: #ccc;
    content: open-quote;
    font-size: 4em;
    line-height: 0.1em;
    margin-right: 0.25em;
    vertical-align: -0.4em;
  }
  p {
    display: inline;
  }
`;

const footerCss = css`
  display: flex;
`;

const newQuoteButtonCss = css`
  margin-left: auto;
  button {
    padding-top: 0.4em;
    padding-bottom: 0.4em;
    box-shadow: none;
  }
`;

const imageWrapperCss = css`
  margin-top: 1em;
`;

const EmptyView = () => {
    const [randomNumber, setRandomNumber] = useState(undefined);

    useEffect(() => {
        setRandomNumber(Math.floor(Math.random() * Math.floor(quotes.length)));
    }, []);

    function getNewQuote() {
        setRandomNumber(Math.floor(Math.random() * Math.floor(quotes.length)));
    }

    const randomQuote = randomNumber !== undefined ? quotes[randomNumber] : undefined;

    return (
        <Layout>
            <Segment raised color='yellow'>
                <Grid stackable>
                    <Grid.Column width={6}>
                        <div css={imageWrapperCss}>
                            <Image centered src='/images/the-rock-pancakes.jpeg' size='large' bordered rounded />
                        </div>
                    </Grid.Column>
                    <Grid.Column width={10}>
                        <div css={messageWrapperCss}>
                            <Message size='big'>
                                <Message.Header>Hi friend! The Rock here. Can you smell what I am cooking?</Message.Header>
                                <Divider />
                                <p>A push-up challenge that starts on {START_DATE} at{' '}
                                    <a href="https://app.slack.com/client/T024VA8T9/CNTT52KV0" target="_blank">
                                        #fun-push-up-challenge
                                    </a>!
                                </p>
                                <Message.List>
                                    <Message.Item>Do some push-ups, log them in Slack with the <Code text='/pushups' /> command.
                                    </Message.Item>
                                    <Message.Item>Challenge another user with the <Code text='/challenge' /> command.
                                    </Message.Item>
                                    <Message.Item>To see your stats, use the <Code text='/mystats' /> command.</Message.Item>
                                    <Message.Item>To see the leaderboard, use the <Code text='/leaderboard' /> command.</Message.Item>
                                </Message.List>
                                <p>
                                    So go stretch out your arms! And enjoy a random quote from yours truly.
                                </p>
                                {randomQuote && (
                                    <div>
                                        <blockquote css={quoteCss}>
                                            {randomQuote.text}
                                        </blockquote>
                                        <div css={footerCss}>
                                            <div>
                                                {randomQuote.author}
                                            </div>
                                            <div css={newQuoteButtonCss}>
                                                <Button basic compact onClick={getNewQuote}>new quote</Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </Message>
                        </div>
                    </Grid.Column>
                </Grid>
            </Segment>
        </Layout>
    )
}

export default EmptyView;