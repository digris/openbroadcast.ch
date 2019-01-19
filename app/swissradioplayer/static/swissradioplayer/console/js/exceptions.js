/**
 * @name exceptions
 * @description All custom exceptions thrown by radioplayer applications
 *
 * > *All intellectual property rights in this Software throughout the world belong to UK Radioplayer,
 * rights in the Software are licensed (not sold) to subscriber stations, and subscriber stations
 * have no rights in, or to, the Software other than the right to use it in accordance with the
 * Terms and Conditions at www.radioplayer.co.uk/terms. You shall not produce any derivate works
 * based on whole or part of the Software, including the source code, for any other purpose other
 * than for usage associated with connecting to the UK Radioplayer Service in accordance with these
 * Terms and Conditions, and you shall not convey nor sublicense the Software, including the source
 * code, for any other purpose or to any third party, without the prior written consent of UK Radioplayer.*
 *
 *
 * @author Frank Sattler <frank@invantio.com>
 *
 *
 * This file is called by:
 * @ adswizz
 *
 * @class exceptions
 * @module exceptions
 */

radioplayer.exceptions = {
  decorateStreamURLException : function() {
    return {
      name: 'decorateStreamURLException',
      message: 'Could not decorate stream URL.'
    };
  }
};
