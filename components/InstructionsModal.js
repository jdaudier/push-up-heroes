import {useState, useEffect} from 'react'
import {Button, Header, Icon, Image, Modal, List} from 'semantic-ui-react'
import Code from '../components/Code';
import quotes from "../utils/quotes";

/** @jsxImportSource @emotion/react */
import {css} from "@emotion/react";

const iconCss = css`
  cursor: pointer;
  display: inline-block;
  margin-left: 4px;
`;

const wavierCss = css`
  font-style: italic;
  line-height: 1.3;
  margin-right: 25px;
  text-align: left;

  @media only screen and (max-width: 768px) {
    margin-right: 0;
  }
`;

const actionsCss = css`
  display: flex;
  @media only screen and (max-width: 768px) {
    flex-direction: column;
  }
`;

const signatureWrapperCss = css`
  display: flex;
  @media only screen and (max-width: 768px) {
    flex-direction: column-reverse;
    text-align: right;
  }
`;

const signatureCss = css`
  @media only screen and (max-width: 768px) {
    margin-top: 20px;
    text-align: right;
  }
`;

// Inspired from https://css-tricks.com/snippets/css/simple-and-nice-blockquote-styling
const quoteCss = css`
  background: #f9f9f9;
  border-left: 10px solid #ccc;
  font-style: italic;
  line-height: 1.5em;
  margin: 1.5em 0;
  min-height: 77px;
  padding: 0.5em 10px;
  position: relative;
  width: 500px;
  quotes: "\\201C""\\201D""\\2018""\\2019";

  ::before {
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

  @media only screen and (max-width: 1200px) {
    width: 420px;
  }

  @media only screen and (max-width: 886px) {
    width: 370px;
  }

  @media only screen and (max-width: 768px) {
    min-height: auto;
    width: auto;
    flex-direction: column;
    margin-bottom: 1em;
  }
`;

const newQuoteButtonCss = css`
  position: relative;
  top: -4px;
  margin-left: auto;
  .ui.button {
    padding-top: 0.4em;
    padding-bottom: 0.4em;
  }
`;

const buttonWrapperCss = css`
  margin-left: auto;
  .ui.button {
    width: max-content;
  }

  @media only screen and (max-width: 768px) {
    width: auto;
    margin-bottom: 1rem;
    margin-top: 20px;
  }
`;

const InstructionsList = () => (
    <List animated verticalAlign='middle'>
        <List.Item>
            <List.Icon name='checkmark' />
            <List.Content>
                <List.Header>
                    Do some push-ups, log them with the <Code text='/pushups' /> command.
                </List.Header>
            </List.Content>
        </List.Item>
        <List.Item>
            <List.Icon name='checkmark' />
            <List.Content>
                <List.Header>
                    Challenge another user with the <Code text='/challenge' /> command.
                </List.Header>
            </List.Content>
        </List.Item>
        <List.Item>
            <List.Icon name='checkmark' />
            <List.Content>
                <List.Header>
                    To see your stats, use the <Code text='/mystats' /> command.
                </List.Header>
            </List.Content>
        </List.Item>
        <List.Item>
            <List.Icon name='checkmark' />
            <List.Content>
                <List.Header>
                    To see the leaderboard, use the <Code text='/leaderboard' /> command.
                </List.Header>
            </List.Content>
        </List.Item>
    </List>
)

const InstructionsModal = () => {
    const [open, setOpen] = useState(false);

    const [randomNumber, setRandomNumber] = useState(undefined);

    useEffect(() => {
        setRandomNumber(Math.floor(Math.random() * Math.floor(quotes.length)));
    }, []);

    function getNewQuote() {
        setRandomNumber(Math.floor(Math.random() * Math.floor(quotes.length)));
    }

    const randomQuote = randomNumber !== undefined ? quotes[randomNumber] : undefined;

    function handleIconClick() {
        setOpen(true);
    }

    const InfoIcon = () => {
        return (
            <span css={iconCss} onClick={handleIconClick}>
            <Icon aria-label="Info" color="blue" name='info circle' size="large" />
        </span>
        )
    }

    return (
        <Modal
            onClose={() => setOpen(false)}
            onOpen={() => setOpen(true)}
            open={open}
            trigger={<InfoIcon />}
        >
            <Modal.Header>Hi friend! The Rock here. Can you smell what I am cooking?</Modal.Header>
            <Modal.Content image>
                <Image bordered rounded size='medium' src='/images/the-rock-pancakes.jpeg' wrapped />
                <Modal.Description>
                    <Header>
                        A push-up challenge at{' '}
                        <a href="https://app.slack.com/client/T024VA8T9/CNTT52KV0" target="_blank">
                            #fun-push-up-challenge
                        </a>!
                    </Header>
                    <p>
                        Here are the{' '}
                        <Icon aria-label="Slack" name="slack" size="large" />
                        Slack commands you can use:
                    </p>
                    <InstructionsList />
                    <p>
                        So go stretch out your arms! And enjoy a random quote from yours truly.
                    </p>
                    {randomQuote && (
                        <div>
                            <blockquote css={quoteCss}>
                                <p>{randomQuote.text}</p>
                            </blockquote>
                            <div css={signatureWrapperCss}>
                                <div css={signatureCss}>
                                    {randomQuote.author}
                                </div>
                                <div css={newQuoteButtonCss}>
                                    <Button basic compact onClick={getNewQuote}>new quote</Button>
                                </div>
                            </div>
                        </div>
                    )}
                </Modal.Description>
            </Modal.Content>
            <Modal.Actions>
                <div css={actionsCss}>
                    <div css={wavierCss}>⚠️ Push-Up Heroes and The Rock are not responsible for any injuries caused by this challenge. Any damage to the body or furniture are the sole responsibility of the participant.</div>
                    <div css={buttonWrapperCss}>
                        <Button onClick={() => setOpen(false)} positive>
                            Let's go!
                        </Button>
                    </div>
                </div>
            </Modal.Actions>
        </Modal>
    )
}

export default InstructionsModal