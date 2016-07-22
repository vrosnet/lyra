'use strict';
var React = require('react'),
    Modal = require('react-modal'),
    connect = require('react-redux').connect,
    addPipeline = require('../../actions/pipelineActions').addPipeline,
    dl = require('datalib'),
    examplePipelines = require('../../constants/exampledatasets');

var FILE_NAME = /([\w\d_-]*)\.?[^\\\/]*$/i;

function mapStateToProps(state, ownProps) {
  return {};
}
function mapDispatchToProps(dispatch, ownProps) {
  return {
    selectPipeline: function(pipeline, dataset, values) {
      dispatch(addPipeline(pipeline, dataset, values));
      ownProps.closeModal();
    }
  };
}
var PipelineModal = React.createClass({
  getInitialState: function() {
    return {
      error: {
        value: false,
        message: ''
      },
      dragActive: 'textarea-dnd'
    };
  },

  proptypes: {
    selectPipeline: React.PropTypes.func
  },

  loadURL: function(url, pipeline, dataset) {
    var that = this,
        fileName = url.match(FILE_NAME)[1];

    /* eslint no-multi-spaces:0 */
    pipeline = pipeline || {name: fileName};
    dataset  = dataset  || {name: fileName, url: url};

    dl.load({url: url}, function(err, data) {
      if (err) {
        // TODO: err is an XHR object and will not have a statusText.
        that.setState({
          error: {
            value: true,
            message: err.statusText
          }
        });
        throw err;
      } else {
        that.props.selectPipeline(pipeline, dataset, that.parseRaw(data, dataset));
      }
    });
  },
  onDragEnter: function(e) {
    e.preventDefault();

    this.setState({
      dragActive: 'textarea-dnd active'
    });
  },
  onDragLeave: function(e) {
    e.preventDefault();

    this.setState({
      dragActive: 'textarea-dnd'
    });
  },
  cpChangeHandler: function(e) {
    e.preventDefault();

    var target = e.target,
        props = this.props,
        type = e.type,
        pipeline = 'name',
        dataset = {
          name: 'name'
        },
        raw;

  parseRaw: function(raw, dataset) {
    var format = dataset.format = {parse: 'auto'},
        parsed;

    try {
      format.type = 'json';
      return dl.read(raw, format);
    } catch (error) {
      format.type = 'csv';
// <<<<<<< HEAD
//       readData = dl.read(raw, format);
//       dataset.format = format;
//
//       if (dl.keys(readData[0]).length === 1) {
//         format.type = 'tsv';
//         readData = dl.read(raw, format);
//         dataset.format = format;
//
//         if (dl.keys(readData[0]).length === 1) {
//           this.setState({
//             error: {
//               value: true,
//               message: 'Trying to import data thats in an unsupported format!'
//             }
//           });
//           throw new Error('Trying to import data thats in an unsupported format!');
//         } else {
//           dataset.values = raw;
//         }
//       } else {
//         dataset.values = raw;
// =======
      parsed = dl.read(raw, format);

      // Test successful parsing of CSV/TSV data by checking # of fields found.
      // If file is TSV but was parsed as CSV, the entire header row will be
      // parsed as a single field.
      if (dl.keys(parsed[0]).length > 1) {
        return parsed;
// >>>>>>> lyra2
      }

      format.type = 'tsv';
      parsed = dl.read(raw, format);
      if (dl.keys(parsed[0]).length > 1) {
        return parsed;
      }

      this.setState({
        error: {
          value: true,
          message: 'Trying to import data thats in an unsupported format!'
        }
      });
      throw new Error('Trying to import data thats in an unsupported format!');
    }

    return [];
  },

  handleSubmit: function(evt) {
    this.loadURL(evt.target.url.value);
    evt.preventDefault();
  },

  cpChangeHandler: function(evt) {
    var that = this,
        props = this.props,
        target = evt.target,
        type = evt.type,
        pipeline = {name: 'name'},
        dataset  = {name: 'name'},
        raw = target.value,
        file, reader;

    evt.preventDefault();
    if (type === 'change') {
      props.selectPipeline(pipeline, dataset, this.parseRaw(raw, dataset));
    } else if (type === 'drop') {
      file = evt.dataTransfer.files[0];
      reader = new FileReader();
      reader.onload = function(loadEvt) {
        pipeline.name = dataset.name = file.name.match(FILE_NAME)[1];
        raw = loadEvt.target.result;
        props.selectPipeline(pipeline, dataset, that.parseRaw(raw, dataset));
      };

      reader.readAsText(file);
    }
  },

  render: function() {
    var props = this.props,
        pipelines = examplePipelines,
        state = this.state,
        error = state.error,
        dragActive = state.dragActive;

    return (
      <Modal
        isOpen={props.modalIsOpen}
        onRequestClose={props.closeModal}>
        <div className="wrapper pipelineModal">
          <span className="closeModal" onClick={props.closeModal}>close</span>

          <div className="partLeft">
            <h2>Examples</h2>

            <div className="sect">
{/*<<<<<<< HEAD
              <h4>Datasets</h4><br />
              <ul className="group">
=======*/}
              <h4>Datasets</h4>

              <ul>
{/*>>>>>>> lyra2*/}
                {pipelines.map(function(pipeline) {
                  var name = pipeline.name,
                      dataset = pipeline.dataset;
                  return (
                    <li key={name}>
{/*<<<<<<< HEAD
                      <button className="button"
                        onClick={props.selectPipeline.bind(null, name, dateset, this.closeModal)}>
=======*/}
                      <button onClick={this.loadURL.bind(this, dataset.url, {name: name}, dataset)}>
{/*>>>>>>> lyra2*/}
                        {name}
                      </button>
                    </li>
                  );
                }, this)}
              </ul>
            </div>
          </div>


          <div className="partRight">
            <h2>Import</h2>

            <label>
              Supported import formats include <abbr title="JavaScripts Object Notation">JSON</abbr>,
              <abbr title="Coma Separated Values">CSV</abbr> and <abbr title="Tab Separated Values">TSV</abbr>.<br />
              All data <strong>must</strong> be in tabular form.
            </label>

            <div className="sect">
              {error.value ? <label className="error">{error.message}</label> : null}
            </div>

            <div className="sect">
              <form onSubmit={this.handleSubmit}>
                <input type="text" name="url" placeholder="Enter url"/>
                <button type="submit" value="Submit" className="button">Load</button><br />
              </form>
            </div>

            <div className="sect">
              <textarea rows="10" cols="70"
                placeholder="Copy and paste or drag and drop"
                name="cnpDnd"
                onChange={this.cpChangeHandler}
                onDrop={this.cpChangeHandler}
                onDragOver={this.onDragEnter}
                onDragLeave={this.onDragLeave}
                className={dragActive}>
              </textarea>
            </div>
          </div>
        </div>
      </Modal>
    );
  }
});

module.exports = connect(mapStateToProps, mapDispatchToProps)(PipelineModal);
