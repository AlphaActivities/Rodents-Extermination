import {readFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
if(createHash('sha256').update(readFileSync('baseline.tar.gz')).digest('hex') !== '716b1c39d4b9b4e77e1a2be3ede00e018fb821168e59a269d1bc99e5a202eefa') throw Error('Baseline checksum mismatch');
mkdirSync('baseline',{recursive:true});
execFileSync('tar',['-xzf','baseline.tar.gz','-C','baseline']);
