const { Container, Row, Col, ListGroup, Breadcrumb } = window.ReactBootstrap;

//to fetch directory 
const fetchData = (req, success) => {
    const url = `http://localhost:8080/list_dir?path=${req}`;
    fetch(url)
        .then(checkStatus)
        .then(res => res.json())
        .then(success)
        .catch(error => console.log(error));
};
//to fetch file and check its type
const fetchFile = (req, success) => {
    const url = `http://localhost:8080/get_file?path=${req}`;
    fetch(url)
        .then(checkStatus)
        .then(res => res.blob())
        .then(success)
        .catch(error => console.log(error));
}
const checkStatus = res => {
    if (res.status === 200)
        return res;
    else {
        const error = new Error(`HTTP Error ${res.status} ${res.statusText} `);
        error.status = res.statusText;
        error.response = res;
        throw error;
    }
}

const ListOfFiles = ({ list, handleClick }) => {
    return (
        <ListGroup as={Row}>
            {list.map((item, index) => (
                <ListGroup.Item
                    onClick={() => handleClick(index)} key={index}>
                    <a href='#' className='stretched-link'> {item.name}</a>
                </ListGroup.Item>))}
        </ListGroup>
    );
}
//Component for navigation
const DirNav = ({ path, handleNavClick }) => {
    const pathToArray = path => {
        let dirArray = path.split('/');

        return dirArray.map((item, index) => {
            const obj = {
                relativePath: dirArray.slice(0, (index + 1)).join('/'),
                dirName: item,
                active: (dirArray.length - 1 === index)
            }
            return obj;
        });
    }
    return (
        <Breadcrumb>
            {pathToArray(path).map((item, index) =>
                <Breadcrumb.Item key={index} active={item.active} href='#' onClick={() => handleNavClick(item.relativePath)}>
                    {item.dirName}
                </Breadcrumb.Item>
            )}
        </Breadcrumb>
    )
}

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentPath: 'home',
            files: []
        }
        this.handleClick = this.handleClick.bind(this);
        this.handleFileRequest = this.handleFileRequest.bind(this);
        this.handleNavClick = this.handleNavClick.bind(this);
    }
    componentDidMount() {
        fetchData(this.state.currentPath, res => this.setState({ ...res }));
    }
    handleClick(index) {
        const req = this.state.currentPath.concat('/', this.state.files[index].name);
        if (this.state.files[index].type === 'file')
            this.handleFileRequest(req);
        else
            fetchData(req, res => this.setState({ ...res }));
    }
    handleNavClick(relativePath) {
        const req = relativePath;
        fetchData(req, res => this.setState({ ...res }));
    }
    handleFileRequest(req) {
        const url = `http://localhost:8080/get_file?path=${req}`;
        fetchFile(req, res => {
            if (res.type === 'application/octet-stream') {
                if (confirm('can\'t view, download file?'))
                    window.open(url);
            } else {
                window.open(url);
            }
        });
    }
    render() {
        return (
            <div>
                <Container className="mt-2">
                    <Row><h2>File Explorer</h2></Row>
                    <Row className='justify-content-md-center'>

                        <Col md={6} className='border border-secondary rounded p-4'>
                            <Row><DirNav path={this.state.currentPath} handleNavClick={this.handleNavClick} /></Row>
                            <ListOfFiles list={this.state.files} handleClick={this.handleClick} />
                        </Col>
                    </Row>
                </Container>
            </div>
        );
    }
}



ReactDOM.render(<App />, document.getElementById('root'));